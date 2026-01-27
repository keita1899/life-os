'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { VisionCategorySidebar } from '@/components/vision/VisionCategorySidebar'
import { useMode } from '@/lib/contexts/ModeContext'
import { useVisionCategories } from '@/hooks/useVisionCategories'

export default function VisionPage() {
  const { mode } = useMode()
  const { categories } = useVisionCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | 'all' | null
  >('all')

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === 'all' || selectedCategoryId === null) {
      return 'すべてのカテゴリー'
    }
    const category = categories.find((c) => c.id === selectedCategoryId)
    return category ? category.name : '不明なカテゴリー'
  }, [selectedCategoryId, categories])

  if (mode !== 'life') {
    return null
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <VisionCategorySidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <div className="flex-1 p-8">
          <h1 className="mb-6 text-3xl font-bold">ビジョン</h1>
          <div className="text-muted-foreground">{selectedCategoryName}</div>
        </div>
      </div>
    </MainLayout>
  )
}
