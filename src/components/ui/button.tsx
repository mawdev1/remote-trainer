import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[rgba(102,126,234,0.4)] hover:shadow-[0_4px_20px_var(--glow-primary)]',
        primary: 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_15px_var(--glow-primary)]',
        secondary: 'bg-transparent border-2 border-[#667eea] text-[#667eea] hover:bg-[#667eea] hover:text-white',
        ghost: 'hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        outline: 'border border-[var(--border-color)] bg-transparent hover:bg-[rgba(102,126,234,0.1)] hover:border-[rgba(102,126,234,0.4)]',
        danger: 'bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] hover:bg-[#ef4444] hover:text-white hover:shadow-[0_4px_15px_rgba(239,68,68,0.3)]',
        warning: 'bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white hover:shadow-[0_4px_15px_rgba(245,158,11,0.3)]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={twMerge(buttonVariants({ variant, size }), className)} {...props} />
    )
  }
)

Button.displayName = 'Button'
