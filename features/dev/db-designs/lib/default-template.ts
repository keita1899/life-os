import type { DbDesignData } from '../types/db-design-data'

export const DEFAULT_DB_DESIGN_DATA: DbDesignData = {
  tables: [
    {
      id: 'default-table-1',
      name: 'users',
      columns: [
        { id: 'default-col-1', name: 'id', type: 'int', constraints: ['PK'] },
        { id: 'default-col-2', name: 'name', type: 'string', constraints: [] },
        { id: 'default-col-3', name: 'email', type: 'string', constraints: [] },
        { id: 'default-col-4', name: 'created_at', type: 'datetime', constraints: [] },
        { id: 'default-col-5', name: 'updated_at', type: 'datetime', constraints: [] },
      ],
    },
  ],
  relationships: [],
}

export function serializeDesignData(data: DbDesignData): string {
  return JSON.stringify(data)
}

export function parseDesignData(content: string): DbDesignData | null {
  try {
    const parsed = JSON.parse(content) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'tables' in parsed &&
      Array.isArray((parsed as DbDesignData).tables)
    ) {
      return parsed as DbDesignData
    }
    return null
  } catch {
    return null
  }
}
