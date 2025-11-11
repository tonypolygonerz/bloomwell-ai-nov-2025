'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button } from '@bloomwell/ui'

interface RenameChatModalProps {
  isOpen: boolean
  onClose: () => void
  currentTitle: string
  chatId: string
  onRename: (chatId: string, newTitle: string) => Promise<void>
}

export function RenameChatModal({
  isOpen,
  onClose,
  currentTitle,
  chatId,
  onRename,
}: RenameChatModalProps) {
  const [title, setTitle] = useState(currentTitle)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle)
      setError(null)
    }
  }, [isOpen, currentTitle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      await onRename(chatId, title.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename chat')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rename Chat</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
            placeholder="Enter new title..."
            autoFocus
            disabled={isLoading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <div className="flex gap-2 mt-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-4 py-2"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

