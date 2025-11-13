'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button } from '@bloomwell/ui'

interface Project {
  id: string
  name: string
  color?: string | null
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
type CreateProjectFn = (name: string) => Promise<Project>
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
type FileToProjectFn = (chatId: string, projectId: string | null) => Promise<void>

interface FileChatModalProps {
  isOpen: boolean
  onClose: () => void
  chatId: string
  currentProjectId: string | null
  projects: Project[]
  onCreateProject: CreateProjectFn
  onFileToProject: FileToProjectFn
}

export function FileChatModal({
  isOpen,
  onClose,
  chatId,
  currentProjectId,
  projects,
  onCreateProject,
  onFileToProject,
}: FileChatModalProps) {
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsCreatingProject(false)
      setNewProjectName('')
      setError(null)
    }
  }, [isOpen])

  const handleFileToProject = async (projectId: string | null) => {
    setIsLoading(true)
    setError(null)
    try {
      await onFileToProject(chatId, projectId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to file chat')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newProjectName.trim()) {
      setError('Project name cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const newProject = await onCreateProject(newProjectName.trim())
      await onFileToProject(chatId, newProject.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">File to Project</h3>

        {!isCreatingProject ? (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {/* Unfile option */}
              <button
                onClick={() => handleFileToProject(null)}
                disabled={isLoading}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-left transition-colors ${
                  currentProjectId === null ? 'bg-gray-50' : ''
                }`}
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-sm text-gray-600">Unfile (move to Recent Chats)</span>
              </button>

              {/* Project list */}
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleFileToProject(project.id)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-left transition-colors ${
                    currentProjectId === project.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <span className="flex-1 text-sm text-gray-700">{project.name}</span>
                </button>
              ))}
            </div>

            {/* Create new project button */}
            <button
              onClick={() => setIsCreatingProject(true)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-left text-brand transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm font-medium">Create new project...</span>
            </button>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </>
        ) : (
          <form onSubmit={handleCreateProject}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none mb-4"
              placeholder="Enter project name..."
              autoFocus
              disabled={isLoading}
            />
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingProject(false)
                  setNewProjectName('')
                  setError(null)
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isLoading || !newProjectName.trim()}
                className="px-4 py-2"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  )
}
