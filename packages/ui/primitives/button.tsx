import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: React.FC<ButtonProps> = ({ className = '', ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-white transition-colors hover:bg-brand-hover ${className}`}
      {...props}
    />
  )
}

