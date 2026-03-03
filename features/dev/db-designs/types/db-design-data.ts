export interface DbColumn {
  id: string
  name: string
  type: string
  constraints: ('PK' | 'FK' | 'UK')[]
}

export interface DbTable {
  id: string
  name: string
  columns: DbColumn[]
}

export type RelationType = '||--||' | '||--o{' | '}o--||' | '}o--o{'

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  '||--||': '1 対 1',
  '||--o{': '1 対 多',
  '}o--||': '多 対 1',
  '}o--o{': '多 対 多',
}

export interface DbRelationship {
  id: string
  fromTableId: string
  toTableId: string
  type: RelationType
  label: string
}

export interface DbDesignData {
  tables: DbTable[]
  relationships: DbRelationship[]
}

export const COLUMN_TYPES = [
  'int',
  'string',
  'text',
  'boolean',
  'date',
  'datetime',
  'float',
  'json',
] as const
