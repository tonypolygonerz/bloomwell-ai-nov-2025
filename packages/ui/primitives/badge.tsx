import React from 'react'
import { cn } from '../utils/cn'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'success'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-800',
    success: 'bg-brand text-white',
  }
  return (
    <span className={cn('inline-block rounded-md px-2 py-1 text-xs', variants[variant], className)}>
      {children}
    </span>
  )
}
