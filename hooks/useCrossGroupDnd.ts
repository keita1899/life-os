import { useState, useMemo, useCallback } from 'react'
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { getTodayDateString, getTomorrowDateString } from '@/lib/date/formats'

interface ItemLike {
  id: number
  title: string
}

/** 汎用グループ型（tasks / events 共通） */
export interface DndGroup {
  key: string
  items: ItemLike[]
}

interface UseCrossGroupDndOptions {
  /** 表示中の全グループ（DnD 対象外のグループも含む） */
  visibleGroups: DndGroup[]
  /** アイテム一覧（activeItem 検索用） */
  allItems: ItemLike[]
  /** グループ内並び替え */
  reorderItems: (updates: { id: number; order: number }[]) => Promise<void>
  /** 日付更新 */
  updateDate: (id: number, date: string | null) => Promise<void>
  /** DnD 対象外のグループキー（例: completed） */
  excludedGroupKeys?: string[]
  /** 同一グループ内の並び替えを無効化（クロスグループ移動のみ許可） */
  disableSameGroupReorder?: boolean
}

export function useCrossGroupDnd({
  visibleGroups,
  allItems,
  reorderItems,
  updateDate,
  excludedGroupKeys = ['completed'],
  disableSameGroupReorder = false,
}: UseCrossGroupDndOptions) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /** DnD 対象グループのみ */
  const dndGroups = useMemo(
    () => visibleGroups.filter((g) => !excludedGroupKeys.includes(g.key)),
    [visibleGroups, excludedGroupKeys],
  )

  const [activeTask, setActiveTask] = useState<ItemLike | null>(null)
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null)
  const [overGroupKey, setOverGroupKey] = useState<string | null>(null)
  /** クロスグループ移動時、このアイテムの前に挿入されることを示す */
  const [insertBeforeId, setInsertBeforeId] = useState<number | null>(null)

  /** アイテムIDからグループキーを引く */
  const findGroupKeyByItemId = useCallback(
    (itemId: number | string): string | undefined => {
      const id = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId
      for (const group of dndGroups) {
        if (group.items.some((t) => t.id === id)) {
          return group.key
        }
      }
      return undefined
    },
    [dndGroups],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = typeof event.active.id === 'string'
        ? parseInt(event.active.id, 10)
        : (event.active.id as number)
      const found = allItems.find((t) => t.id === id)
      setActiveTask(found ?? null)
      for (const group of dndGroups) {
        if (group.items.some((t) => t.id === id)) {
          setActiveGroupKey(group.key)
          break
        }
      }
    },
    [allItems, dndGroups],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) {
        setOverGroupKey(null)
        setInsertBeforeId(null)
        return
      }
      const overId = String(over.id)
      const activeId = typeof active.id === 'string' ? parseInt(active.id, 10) : (active.id as number)

      if (overId.startsWith('group-')) {
        const groupKey = overId.replace('group-', '')
        setOverGroupKey(groupKey)
        setInsertBeforeId(null)
      } else {
        const targetGroup = findGroupKeyByItemId(overId)
        setOverGroupKey(targetGroup ?? null)
        const sourceGroup = findGroupKeyByItemId(activeId)
        // クロスグループ移動時のみ挿入位置を表示
        if (targetGroup && sourceGroup !== targetGroup) {
          const itemId = typeof over.id === 'string' ? parseInt(over.id, 10) : (over.id as number)
          setInsertBeforeId(itemId)
        } else {
          setInsertBeforeId(null)
        }
      }
    },
    [findGroupKeyByItemId],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveTask(null)
      setActiveGroupKey(null)
      setOverGroupKey(null)
      setInsertBeforeId(null)

      if (!over) return

      const activeId = typeof active.id === 'string' ? parseInt(active.id, 10) : (active.id as number)
      const overId = String(over.id)

      const sourceGroupKey = findGroupKeyByItemId(activeId)
      if (!sourceGroupKey) return

      let targetGroupKey: string | undefined
      if (overId.startsWith('group-')) {
        targetGroupKey = overId.replace('group-', '')
      } else {
        targetGroupKey = findGroupKeyByItemId(overId)
      }
      if (!targetGroupKey) return

      if (sourceGroupKey === targetGroupKey) {
        // 同一グループ内の並び替え
        if (disableSameGroupReorder) return
        if (active.id === over.id) return
        const group = dndGroups.find((g) => g.key === sourceGroupKey)
        if (!group) return

        const oldIndex = group.items.findIndex((t) => t.id === activeId)
        const overItemId = typeof over.id === 'string' ? parseInt(over.id, 10) : (over.id as number)
        const newIndex = group.items.findIndex((t) => t.id === overItemId)
        if (oldIndex === -1 || newIndex === -1) return

        const reordered = arrayMove(group.items, oldIndex, newIndex)
        const updates = reordered.map((item, i) => ({ id: item.id, order: i }))
        void reorderItems(updates)
      } else {
        // 異なるグループへの移動
        let newDate: string | null
        if (targetGroupKey === 'today' || targetGroupKey === 'overdue') {
          newDate = getTodayDateString()
        } else if (targetGroupKey === 'tomorrow') {
          newDate = getTomorrowDateString()
        } else if (targetGroupKey === 'none') {
          newDate = null
        } else {
          newDate = targetGroupKey
        }

        const targetGroup = dndGroups.find((g) => g.key === targetGroupKey)
        const targetItems = targetGroup?.items ?? []

        // 挿入位置を決定
        let insertIndex = targetItems.length // デフォルト: 末尾
        if (!overId.startsWith('group-')) {
          const overItemId = typeof over.id === 'string' ? parseInt(over.id, 10) : (over.id as number)
          const overIndex = targetItems.findIndex((t) => t.id === overItemId)
          if (overIndex !== -1) {
            insertIndex = overIndex
          }
        }

        // 移動先グループの order を振り直し（移動アイテムを挿入位置に含める）
        const newOrder: { id: number; order: number }[] = []
        let order = 0
        for (let i = 0; i < targetItems.length; i++) {
          if (i === insertIndex) {
            newOrder.push({ id: activeId, order: order++ })
          }
          newOrder.push({ id: targetItems[i].id, order: order++ })
        }
        // 末尾挿入の場合
        if (insertIndex >= targetItems.length) {
          newOrder.push({ id: activeId, order: order })
        }

        void Promise.all([
          updateDate(activeId, newDate),
          reorderItems(newOrder),
        ])
      }
    },
    [findGroupKeyByItemId, dndGroups, reorderItems, updateDate, disableSameGroupReorder],
  )

  const handleDragCancel = useCallback(() => {
    setActiveTask(null)
    setActiveGroupKey(null)
    setOverGroupKey(null)
    setInsertBeforeId(null)
  }, [])

  /** グループがドロップ先としてハイライトされるか判定 */
  const isDropTarget = useCallback(
    (groupKey: string) =>
      overGroupKey === groupKey && activeGroupKey !== groupKey,
    [overGroupKey, activeGroupKey],
  )

  return {
    sensors,
    activeTask,
    insertBeforeId,
    isDropTarget,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}
