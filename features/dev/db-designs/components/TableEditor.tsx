'use client'

import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type {
  DbDesignData,
  DbTable,
  DbColumn,
  DbRelationship,
  RelationType,
} from '../types/db-design-data'
import { COLUMN_TYPES, RELATION_TYPE_LABELS } from '../types/db-design-data'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ── カラム行 ──

interface ColumnRowProps {
  column: DbColumn
  onUpdate: (col: DbColumn) => void
  onDelete: () => void
}

function SortableColumnRow({ column, onUpdate, onDelete }: ColumnRowProps): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/col flex items-center gap-1.5',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-0.5 opacity-0 transition-opacity group-hover/col:opacity-100"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
      </button>
      <input
        type="text"
        value={column.name}
        onChange={(e) => onUpdate({ ...column, name: e.target.value })}
        placeholder="カラム名"
        className="h-7 w-28 rounded border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <select
        value={column.type}
        onChange={(e) => onUpdate({ ...column, type: e.target.value })}
        className="h-7 w-24 rounded border border-input bg-background px-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {COLUMN_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={column.constraints.includes('PK')}
          onChange={(e) => {
            const next = e.target.checked
              ? [...column.constraints.filter((c) => c !== 'PK'), 'PK' as const]
              : column.constraints.filter((c) => c !== 'PK')
            onUpdate({ ...column, constraints: next })
          }}
          className="h-3.5 w-3.5"
        />
        PK
      </label>
      <label className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={column.constraints.includes('FK')}
          onChange={(e) => {
            const next = e.target.checked
              ? [...column.constraints.filter((c) => c !== 'FK'), 'FK' as const]
              : column.constraints.filter((c) => c !== 'FK')
            onUpdate({ ...column, constraints: next })
          }}
          className="h-3.5 w-3.5"
        />
        FK
      </label>
      <button
        type="button"
        onClick={onDelete}
        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover/col:opacity-100"
        title="カラムを削除"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── テーブルカード ──

interface TableCardProps {
  table: DbTable
  onUpdate: (table: DbTable) => void
  onDelete: () => void
}

function TableCard({
  table,
  onUpdate,
  onDelete,
}: TableCardProps): ReactElement {
  const [isOpen, setIsOpen] = useState(true)

  const handleUpdateColumn = useCallback(
    (colId: string, updated: DbColumn) => {
      onUpdate({
        ...table,
        columns: table.columns.map((c) => (c.id === colId ? updated : c)),
      })
    },
    [table, onUpdate],
  )

  const handleDeleteColumn = useCallback(
    (colId: string) => {
      onUpdate({
        ...table,
        columns: table.columns.filter((c) => c.id !== colId),
      })
    },
    [table, onUpdate],
  )

  const handleAddColumn = useCallback(() => {
    onUpdate({
      ...table,
      columns: [
        ...table.columns,
        { id: generateId(), name: '', type: 'string', constraints: [] },
      ],
    })
  }, [table, onUpdate])

  const handleColumnDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = table.columns.findIndex((c) => c.id === active.id)
      const newIndex = table.columns.findIndex((c) => c.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = [...table.columns]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)
      onUpdate({ ...table, columns: reordered })
    },
    [table, onUpdate],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  return (
    <div className="rounded-md border border-input">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="shrink-0 text-muted-foreground"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <input
          type="text"
          value={table.name}
          onChange={(e) => onUpdate({ ...table, name: e.target.value })}
          placeholder="テーブル名"
          className="h-7 flex-1 rounded border border-input bg-background px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <span className="text-xs text-muted-foreground">
          {table.columns.length} カラム
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="テーブルを削除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {isOpen && (
        <div className="space-y-1.5 border-t px-3 py-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleColumnDragEnd}
          >
            <SortableContext
              items={table.columns.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {table.columns.map((col) => (
                <SortableColumnRow
                  key={col.id}
                  column={col}
                  onUpdate={(updated) => handleUpdateColumn(col.id, updated)}
                  onDelete={() => handleDeleteColumn(col.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={handleAddColumn}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            カラムを追加
          </button>
        </div>
      )}
    </div>
  )
}

// ── リレーション行 ──

interface RelationshipRowProps {
  relationship: DbRelationship
  tables: DbTable[]
  onUpdate: (rel: DbRelationship) => void
  onDelete: () => void
}

function RelationshipRow({
  relationship,
  tables,
  onUpdate,
  onDelete,
}: RelationshipRowProps): ReactElement {
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={relationship.fromTableId}
        onChange={(e) =>
          onUpdate({ ...relationship, fromTableId: e.target.value })
        }
        className="h-7 w-28 rounded border border-input bg-background px-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">テーブル</option>
        {tables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name || '(未命名)'}
          </option>
        ))}
      </select>
      <select
        value={relationship.type}
        onChange={(e) =>
          onUpdate({
            ...relationship,
            type: e.target.value as RelationType,
          })
        }
        className="h-7 w-24 rounded border border-input bg-background px-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {(
          Object.entries(RELATION_TYPE_LABELS) as [RelationType, string][]
        ).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={relationship.toTableId}
        onChange={(e) =>
          onUpdate({ ...relationship, toTableId: e.target.value })
        }
        className="h-7 w-28 rounded border border-input bg-background px-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">テーブル</option>
        {tables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name || '(未命名)'}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={relationship.label}
        onChange={(e) =>
          onUpdate({ ...relationship, label: e.target.value })
        }
        placeholder="ラベル"
        className="h-7 w-20 rounded border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button
        type="button"
        onClick={onDelete}
        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        title="リレーションを削除"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── メインエディタ ──

interface TableEditorProps {
  data: DbDesignData
  onChange: (data: DbDesignData) => void
}

export function TableEditor({
  data,
  onChange,
}: TableEditorProps): ReactElement {
  const handleUpdateTable = useCallback(
    (tableId: string, updated: DbTable) => {
      onChange({
        ...data,
        tables: data.tables.map((t) => (t.id === tableId ? updated : t)),
      })
    },
    [data, onChange],
  )

  const handleDeleteTable = useCallback(
    (tableId: string) => {
      onChange({
        ...data,
        tables: data.tables.filter((t) => t.id !== tableId),
        relationships: data.relationships.filter(
          (r) => r.fromTableId !== tableId && r.toTableId !== tableId,
        ),
      })
    },
    [data, onChange],
  )

  const handleAddTable = useCallback(() => {
    const newTable: DbTable = {
      id: generateId(),
      name: '',
      columns: [
        { id: generateId(), name: 'id', type: 'int', constraints: ['PK'] },
      ],
    }
    onChange({ ...data, tables: [...data.tables, newTable] })
  }, [data, onChange])

  const handleUpdateRelationship = useCallback(
    (relId: string, updated: DbRelationship) => {
      onChange({
        ...data,
        relationships: data.relationships.map((r) =>
          r.id === relId ? updated : r,
        ),
      })
    },
    [data, onChange],
  )

  const handleDeleteRelationship = useCallback(
    (relId: string) => {
      onChange({
        ...data,
        relationships: data.relationships.filter((r) => r.id !== relId),
      })
    },
    [data, onChange],
  )

  const handleAddRelationship = useCallback(() => {
    const newRel: DbRelationship = {
      id: generateId(),
      fromTableId: data.tables[0]?.id ?? '',
      toTableId: data.tables[1]?.id ?? data.tables[0]?.id ?? '',
      type: '||--o{',
      label: 'has',
    }
    onChange({ ...data, relationships: [...data.relationships, newRel] })
  }, [data, onChange])

  return (
    <div
      className={cn(
        'space-y-4 overflow-y-auto pr-1',
        'max-h-[calc(100vh-300px)]',
      )}
    >
      {/* テーブル */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">テーブル</h3>
          <button
            type="button"
            onClick={handleAddTable}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            追加
          </button>
        </div>
        <div className="space-y-2">
          {data.tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onUpdate={(updated) => handleUpdateTable(table.id, updated)}
              onDelete={() => handleDeleteTable(table.id)}
            />
          ))}
          {data.tables.length === 0 && (
            <p className="py-4 text-center text-sm italic text-muted-foreground">
              テーブルがありません
            </p>
          )}
        </div>
      </div>

      {/* リレーション */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">リレーション</h3>
          <button
            type="button"
            onClick={handleAddRelationship}
            disabled={data.tables.length < 2}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            <Plus className="h-3.5 w-3.5" />
            追加
          </button>
        </div>
        <div className="space-y-1.5">
          {data.relationships.map((rel) => (
            <RelationshipRow
              key={rel.id}
              relationship={rel}
              tables={data.tables}
              onUpdate={(updated) =>
                handleUpdateRelationship(rel.id, updated)
              }
              onDelete={() => handleDeleteRelationship(rel.id)}
            />
          ))}
          {data.relationships.length === 0 && (
            <p className="py-2 text-center text-xs italic text-muted-foreground">
              リレーションがありません
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
