import React from 'react'
import { cn } from '../utils/cn'

export interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, children, className }) => {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full rounded-md bg-white p-4 shadow-lg',
          className ? className : 'max-w-lg',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
