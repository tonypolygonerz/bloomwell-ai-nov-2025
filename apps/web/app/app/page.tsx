'use client'

import { useState } from 'react'
import { Input } from '@bloomwell/ui'
import { ProfileCompletionFloating } from '@/components/app/profile-completion-floating'

export default function DashboardPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>(
    [],
  )
  const [isLoading, setIsLoading] = useState(false)
  const [enableWebSearch, setEnableWebSearch] = useState(false)

  const quickActions = [
    { text: 'Help me find a federal grant', prompt: 'Find federal grants for my nonprofit' },
    { text: 'Help me start a nonprofit', prompt: 'Guide me through starting a nonprofit' },
    { text: 'Help me write a grant proposal', prompt: 'Help me write a grant proposal' },
    { text: 'Help me with my board', prompt: 'Provide guidance on nonprofit board management' },
  ]

  const handleQuickAction = async (prompt: string) => {
    setMessage(prompt)
    await handleSubmit(prompt)
  }

  const handleSubmit = async (inputMessage?: string) => {
    const userMessage = inputMessage || message
    if (!userMessage.trim()) return

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          enableWebSearch,
        }),
      })

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ProfileCompletionFloating />
      <div className="flex-1 overflow-y-auto p-8">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">
              Start a conversation. Ask me anything about{' '}
              <span className="text-brand">
                nonprofit management, grants or organizational development
              </span>
            </h2>
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-colors hover:border-brand hover:bg-green-50"
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 p-4">Thinking...</div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={enableWebSearch}
                onChange={(e) => setEnableWebSearch(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Enable web search</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || !message.trim()}
              className="rounded-md bg-brand px-4 py-2 text-white hover:bg-brand-hover disabled:opacity-50"
            >
              ↑
            </button>
          </div>
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between text-xs text-gray-500">
          <span>Upload doc or image (max 5 files, 35MB each)</span>
          <span>Tokens remaining: 10,000</span>
        </div>
      </div>
    </div>
  )
}
