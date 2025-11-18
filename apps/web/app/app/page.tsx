'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Input } from '@bloomwell/ui'
import { ProfileCompletionFloating } from '@/components/app/profile-completion-floating'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>(
    [],
  )
  const [isLoading, setIsLoading] = useState(false)
  const [enableWebSearch, setEnableWebSearch] = useState(false)
  
  const userName = session?.user?.name ?? 'User'

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
      <main className="flex-1 px-0 sm:px-6 lg:px-8 flex flex-col pt-20">
        {/* Greeting - Always visible */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
            Good to see you, {userName}.
          </h1>
        </div>

        {/* Chat Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {messages.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400">
              Start a conversation to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 text-slate-600 dark:text-slate-400">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions - Show when no messages */}
        {messages.length === 0 && (
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.prompt)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md p-4 text-left transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300"
              >
                {action.text}
              </button>
            ))}
          </div>
        )}
      </main>
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <div className="mx-auto max-w-3xl w-full">
          <div className="mb-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={enableWebSearch}
                onChange={(e) => setEnableWebSearch(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
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
              className="rounded-lg bg-emerald-500 dark:bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 transition-colors duration-200"
            >
              ↑
            </button>
          </div>
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Upload doc or image (max 5 files, 35MB each)</span>
          <span>Tokens remaining: 10,000</span>
        </div>
      </div>
    </div>
  )
}
