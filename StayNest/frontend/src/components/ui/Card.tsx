import React from 'react'

/**
 * Reusable card primitive built with Tailwind.
 * Optional `title` renders a header; `children` form the body.
 */
export default function Card({ title, children, className = '', ...props }) {
  const base =
    'rounded-xl border border-border bg-card shadow-md'
  const classes = `${base} ${className}`.trim()
  return (
    <div className={classes} {...props}>
      {title ? (
        <div className="border-b border-border px-4 py-3 text-base font-semibold text-foreground">
          {title}
        </div>
      ) : null}
      <div className={title ? 'p-4' : 'p-4'}>{children}</div>
    </div>
  )
}
