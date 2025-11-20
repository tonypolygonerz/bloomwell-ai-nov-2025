'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@bloomwell/ui'
import { Facebook, Linkedin, Twitter, Mail, Link as LinkIcon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  webinar: {
    id: string
    title: string
    subtitle: string | null
  }
}

export function ShareModal({ isOpen, onClose, webinar }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/app/webinars/${webinar.id}`
      setShareUrl(url)
    }
  }, [webinar.id])

  const addUTMParams = (baseUrl: string, source: string) => {
    const url = new URL(baseUrl)
    url.searchParams.set('utm_source', source)
    url.searchParams.set('utm_medium', 'social')
    url.searchParams.set('utm_campaign', 'webinar_share')
    return url.toString()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareText = `${webinar.title}${webinar.subtitle ? ` - ${webinar.subtitle}` : ''}`
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(shareText)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    email: `mailto:?subject=${encodedText}&body=${encodeURIComponent(`Check out this webinar: ${shareUrl}`)}`,
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    const url = addUTMParams(shareLinks[platform], platform)
    window.open(url, '_blank', 'width=600,height=400')
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Share this webinar</h3>

        {/* Share URL display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700"
            />
            <button
              onClick={handleCopyLink}
              className={cn(
                'px-4 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors flex items-center',
                copied
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social sharing options */}
        <div className="space-y-2">
          <button
            onClick={() => handleShare('facebook')}
            className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
          >
            <Facebook className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700 font-medium">Share on Facebook</span>
          </button>

          <button
            onClick={() => handleShare('linkedin')}
            className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
          >
            <Linkedin className="w-5 h-5 text-blue-700" />
            <span className="text-gray-700 font-medium">Share on LinkedIn</span>
          </button>

          <button
            onClick={() => handleShare('twitter')}
            className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
          >
            <Twitter className="w-5 h-5 text-blue-400" />
            <span className="text-gray-700 font-medium">Share on Twitter</span>
          </button>

          <a
            href={shareLinks.email}
            className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
          >
            <Mail className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Share via Email</span>
          </a>
        </div>

        {/* Close button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

