import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'default'
}

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  default: 'px-4 py-2',
}

export const Button: React.FC<ButtonProps> = ({ className = '', size = 'default', ...props }) => {
  const sizeClass = sizeClasses[size]
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-brand text-white transition-colors hover:bg-brand-hover ${sizeClass} ${className}`}
      {...props}
    />
  )
}
