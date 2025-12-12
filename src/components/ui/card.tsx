import * as React from 'react'

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={(className || '') + ' rounded-xl border bg-white text-gray-900 shadow-sm transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'} {...props} />
)

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={(className || '') + ' flex flex-col space-y-1.5 p-4'} {...props} />
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={(className || '') + ' text-lg font-semibold leading-none tracking-tight'} {...props} />
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={(className || '') + ' text-sm text-gray-500 dark:text-gray-400'} {...props} />
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={(className || '') + ' p-4 pt-0'} {...props} />
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={(className || '') + ' flex items-center p-4 pt-0'} {...props} />
)
