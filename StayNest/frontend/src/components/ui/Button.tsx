import React from 'react'

/**
 * Reusable button primitive.
 * Variants map to the Tailwind utility classes defined in index.css (.btn-*).
 * No UI component library is used — the UI is built with Tailwind directly.
 */
const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const classes = `${variantClasses[variant] || variantClasses.primary} ${className}`.trim()
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
