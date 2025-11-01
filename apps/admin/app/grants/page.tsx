'use client'

import { useState, useEffect } from 'react'
import { Button, Card } from '@bloomwell/ui'

interface GrantStats {
  total: number
  active: number
  expired: number
}

// eslint-disable-next-line @typescript-eslint/naming-convention, max-lines-per-function
export default function GrantsPage(): JSX.Element {
  const [stats, setStats] = useState<GrantStats>({ total: 0, active: 0, expired: 0 })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    kept: number
    rejected: number
    errors: string[]
    timestamp: Date
  } | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/grants/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleSync = async (): Promise<void> => {
    setIsSyncing(true)
    setSyncResult(null)

    try {
      const response = await fetch('/api/admin/grants/sync', {
        method: 'POST',
      })

      const result = await response.json()
      if (response.ok) {
        setSyncResult(result)
        await fetchStats()
      } else {
        setSyncResult({
          kept: 0,
          rejected: 0,
          errors: [result.error || 'Sync failed'],
          timestamp: new Date(),
        })
      }
    } catch (error) {
      setSyncResult({
        kept: 0,
        rejected: 0,
        errors: ['Failed to sync grants'],
        timestamp: new Date(),
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold">Grants Management</h1>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Total Grants</h3>
          <p className="text-4xl font-bold text-brand">{stats.total}</p>
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Active Grants</h3>
          <p className="text-4xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Expired Grants</h3>
          <p className="text-4xl font-bold text-gray-400">{stats.expired}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-bold">Grants Data Sync</h2>
        <p className="mb-4 text-gray-600">
          Sync grants from grants.gov. This will download the latest XML, filter for nonprofit
          relevance, and update the database.
        </p>
        <Button onClick={handleSync} disabled={isSyncing} className="mb-4">
          {isSyncing ? 'Syncing...' : 'Sync Grants Data'}
        </Button>

        {syncResult && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold">Last Sync Results</h3>
            <p className="text-sm">
              <span className="font-medium">Kept:</span> {syncResult.kept} grants
            </p>
            <p className="text-sm">
              <span className="font-medium">Rejected:</span> {syncResult.rejected} grants
            </p>
            {syncResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-600">Errors:</p>
                <ul className="list-disc pl-6 text-sm text-red-600">
                  {syncResult.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {new Date(syncResult.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
