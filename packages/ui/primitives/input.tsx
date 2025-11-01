import React from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors',
        'focus:border-brand hover:border-brand',
        className,
      )}
      {...props}
    />
  )
}
