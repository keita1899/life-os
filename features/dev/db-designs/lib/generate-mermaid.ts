import type { DbDesignData } from '../types/db-design-data'

export function generateMermaidErDiagram(data: DbDesignData): string {
  const lines: string[] = ['erDiagram']

  const tableMap = new Map(data.tables.map((t) => [t.id, t]))

  // テーブル定義
  for (const table of data.tables) {
    if (!table.name.trim()) continue
    lines.push(`    ${table.name} {`)
    for (const col of table.columns) {
      if (!col.name.trim()) continue
      const constraint = col.constraints.length > 0
        ? ` ${col.constraints.join(',')}`
        : ''
      lines.push(`        ${col.type} ${col.name}${constraint}`)
    }
    lines.push('    }')
  }

  // リレーション
  for (const rel of data.relationships) {
    const from = tableMap.get(rel.fromTableId)
    const to = tableMap.get(rel.toTableId)
    if (!from?.name.trim() || !to?.name.trim()) continue
    const label = rel.label.trim() || 'relates'
    lines.push(`    ${from.name} ${rel.type} ${to.name} : "${label}"`)
  }

  return lines.join('\n')
}
