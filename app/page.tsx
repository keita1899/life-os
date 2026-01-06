'use client'

import { useEffect, useState } from 'react'
import { getDatabase } from '@/lib/db'

export default function Home() {
  const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [dbMessage, setDbMessage] = useState<string>('')
  const [testData, setTestData] = useState<unknown[]>([])

  const testConnection = async () => {
    setDbStatus('testing')
    setDbMessage('接続中...')

    try {
      const db = await getDatabase()
      
      await db.execute(`
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await db.execute('INSERT INTO test_table (message) VALUES (?)', ['Hello SQLite!'])

      const result = await db.select<{ id: number; message: string; created_at: string }[]>(
        'SELECT * FROM test_table ORDER BY id DESC LIMIT 5'
      )

      setTestData(result)
      setDbStatus('success')
      setDbMessage(`接続成功！テストデータ ${result.length} 件取得`)
    } catch (error) {
      setDbStatus('error')
      setDbMessage(`エラー: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <h1 className="mb-8 text-3xl font-semibold text-black dark:text-zinc-50">
            SQLite 接続テスト
          </h1>
          
          <div className="mb-8 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                接続ステータス:
              </p>
              <div className="flex items-center gap-2">
                {dbStatus === 'idle' && (
                  <span className="text-zinc-500">待機中</span>
                )}
                {dbStatus === 'testing' && (
                  <span className="text-blue-500">テスト中...</span>
                )}
                {dbStatus === 'success' && (
                  <span className="text-green-500">✓ 成功</span>
                )}
                {dbStatus === 'error' && (
                  <span className="text-red-500">✗ エラー</span>
                )}
              </div>
            </div>
            
            {dbMessage && (
              <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
                {dbMessage}
              </p>
            )}
            
            <button
              onClick={testConnection}
              disabled={dbStatus === 'testing'}
              className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              再接続テスト
            </button>
          </div>

          {testData.length > 0 && (
            <div className="w-full rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
              <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
                テストデータ
              </h2>
              <pre className="overflow-auto rounded bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
                {JSON.stringify(testData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
