import * as React from 'react'

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div 
    className={
      (className || '') + 
      ' rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-[var(--card-shadow)] transition-all duration-300 hover:border-[rgba(102,126,234,0.3)] hover:shadow-[0_8px_30px_var(--glow-primary)] hover:-translate-y-0.5'
    } 
    {...props} 
  />
)

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={(className || '') + ' flex flex-col space-y-1.5 p-5'} {...props} />
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={(className || '') + ' text-lg font-bold leading-none tracking-tight'} {...props} />
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={(className || '') + ' text-sm text-[var(--text-muted)]'} {...props} />
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={(className || '') + ' p-5 pt-0'} {...props} />
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={(className || '') + ' flex items-center p-5 pt-0'} {...props} />
)
