'use client'

import type { ReactElement } from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'

const RENDER_DEBOUNCE_MS = 300
const ZOOM_STEP = 0.2
const ZOOM_MIN = 0.1
const ZOOM_MAX = 5

let mermaidInstance: typeof import('mermaid').default | null = null
let initPromise: Promise<void> | null = null

function getMermaid(): Promise<typeof import('mermaid').default> {
  if (mermaidInstance) return Promise.resolve(mermaidInstance)
  if (!initPromise) {
    initPromise = import('mermaid').then((mod) => {
      mermaidInstance = mod.default
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
      })
    })
  }
  return initPromise.then(() => mermaidInstance!)
}

function parseSvgDimensions(svgString: string): {
  width: number
  height: number
} | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgEl = doc.querySelector('svg')
  if (!svgEl) return null

  const w =
    parseFloat(svgEl.getAttribute('width') ?? '') ||
    svgEl.viewBox?.baseVal?.width ||
    0
  const h =
    parseFloat(svgEl.getAttribute('height') ?? '') ||
    svgEl.viewBox?.baseVal?.height ||
    0

  return w > 0 && h > 0 ? { width: w, height: h } : null
}

interface MermaidRendererProps {
  content: string
}

let renderCounter = 0

export function MermaidRenderer({
  content,
}: MermaidRendererProps): ReactElement {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fitScale, setFitScale] = useState(1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })

  const updateTheme = useCallback((isDark: boolean) => {
    if (!mermaidInstance) return
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
    })
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => updateTheme(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [updateTheme])

  useEffect(() => {
    if (!content.trim()) return

    const timeoutId = setTimeout(async () => {
      try {
        const mm = await getMermaid()
        renderCounter += 1
        const id = `mermaid_diagram_${renderCounter}`
        const { svg: renderedSvg } = await mm.render(id, content)
        setSvg(renderedSvg)
        setError(null)

        // fit-to-width 値を計算（リセットボタン用に保持）
        const dims = parseSvgDimensions(renderedSvg)
        const container = viewportRef.current
        if (dims && container) {
          const containerWidth = container.clientWidth
          const computed = containerWidth / dims.width
          setFitScale(Math.min(Math.max(computed, ZOOM_MIN), ZOOM_MAX))
        } else {
          setFitScale(1)
        }
        setScale(1)
        setTranslate({ x: 0, y: 0 })
      } catch (err) {
        document
          .querySelectorAll('[id^="dmermaid_diagram_"]')
          .forEach((el) => el.remove())
        setError(
          err instanceof Error ? err.message : 'ER図のレンダリングに失敗しました',
        )
        setSvg('')
      }
    }, RENDER_DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [content])

  // フルスクリーン切替時に fit-to-width を再計算
  useEffect(() => {
    if (!svg || !viewportRef.current) return

    const rafId = requestAnimationFrame(() => {
      const dims = parseSvgDimensions(svg)
      const container = viewportRef.current
      if (!dims || !container) return
      const containerWidth = container.clientWidth
      const computed = containerWidth / dims.width
      setFitScale(Math.min(Math.max(computed, ZOOM_MIN), ZOOM_MAX))
      setScale(1)
      setTranslate({ x: 0, y: 0 })
    })
    return () => cancelAnimationFrame(rafId)
  }, [isFullscreen, svg])

  const clampScale = useCallback(
    (s: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, s)),
    [],
  )

  const handleZoomIn = useCallback(
    () => setScale((s) => clampScale(s + ZOOM_STEP)),
    [clampScale],
  )

  const handleZoomOut = useCallback(
    () => setScale((s) => clampScale(s - ZOOM_STEP)),
    [clampScale],
  )

  const handleFitToWidth = useCallback(() => {
    setScale(fitScale)
    setTranslate({ x: 0, y: 0 })
  }, [fitScale])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      setScale((s) => clampScale(s + delta))
    },
    [clampScale],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true
      dragStart.current = { x: e.clientX, y: e.clientY }
      translateStart.current = { ...translate }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [translate],
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    setTranslate({
      x: translateStart.current.x + (e.clientX - dragStart.current.x),
      y: translateStart.current.y + (e.clientY - dragStart.current.y),
    })
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const trimmedContent = content.trim()

  if (!trimmedContent) {
    return (
      <p className="text-sm italic text-muted-foreground">
        erDiagram 構文を入力するとプレビューが表示されます
      </p>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">構文エラー</p>
        <pre className="mt-2 whitespace-pre-wrap text-xs">{error}</pre>
      </div>
    )
  }

  if (!svg) {
    return (
      <p className="text-sm italic text-muted-foreground">
        レンダリング中...
      </p>
    )
  }

  const zoomPercent = Math.round(scale * 100)

  const toolbar = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleZoomOut}
        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        title="縮小"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <span className="min-w-[3.5rem] text-center text-xs text-muted-foreground">
        {zoomPercent}%
      </span>
      <button
        type="button"
        onClick={handleZoomIn}
        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        title="拡大"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={handleFitToWidth}
        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        title="幅に合わせる"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={toggleFullscreen}
        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        title={isFullscreen ? '元に戻す' : '全画面'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </button>
    </div>
  )

  const viewportContent = (
    <div
      ref={viewportRef}
      className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ minHeight: isFullscreen ? undefined : 320 }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="flex items-center justify-between border-b px-4 py-2">
          {toolbar}
          <span className="text-xs text-muted-foreground">
            ESC で閉じる
          </span>
        </div>
        {viewportContent}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {toolbar}
      {viewportContent}
    </div>
  )
}
