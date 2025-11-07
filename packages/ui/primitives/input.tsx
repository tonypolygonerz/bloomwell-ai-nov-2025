import React from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

export const Input: React.FC<InputProps> = ({ className = '', error, success, ...props }) => {
  return (
    <input
      className={cn(
        'w-full rounded-md border px-3 py-2 outline-none transition-all duration-200',
        'focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
          : success
            ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
            : 'border-gray-300 focus:border-brand hover:border-gray-400 focus:ring-brand/20',
        className,
      )}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
  )
}
