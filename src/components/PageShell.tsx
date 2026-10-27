import type { ReactNode } from 'react'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {children}
    </div>
  )
}
