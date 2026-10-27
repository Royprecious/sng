import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { CameroonBadge } from './CameroonStripe'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/soldiers', label: 'Soldiers' },
  { to: '/members', label: 'Members' },
  { to: '/tiers', label: 'Tier Board' },
  { to: '/tournament', label: 'Tournament' },
  { to: '/winners', label: 'Winners' },
  { to: '/admin', label: 'Admin' },
] as const

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block min-h-11 rounded-lg px-4 py-3 text-sm font-semibold tracking-wide uppercase transition touch-manipulation',
    isActive
      ? 'bg-blue-600/25 text-blue-300 ring-1 ring-blue-500/40'
      : 'text-slate-300 hover:bg-slate-800/80 hover:text-blue-200 active:bg-slate-800',
  ].join(' ')

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-2.5 py-2 text-xs font-semibold tracking-wide uppercase transition xl:px-3 xl:text-sm',
    isActive
      ? 'bg-blue-600/25 text-blue-300 ring-1 ring-blue-500/40'
      : 'text-slate-400 hover:bg-slate-800/80 hover:text-blue-200',
  ].join(' ')

function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] md:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 touch-manipulation bg-black/70 backdrop-blur-sm"
        aria-label="Close menu overlay"
        onClick={onClose}
      />
      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="absolute top-0 right-0 flex h-dvh max-h-dvh w-[min(100%,20rem)] flex-col border-l border-slate-800 bg-slate-950 shadow-2xl"
        style={{
          paddingTop: 'max(0.375rem, env(safe-area-inset-top))',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-4 py-4">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
            Menu
          </span>
          <CameroonBadge />
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : undefined}
              className={navLinkClass}
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>,
    document.body,
  )
}

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const close = () => setOpen(false)

  useEffect(() => {
    close()
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex lg:gap-2">
        <CameroonBadge className="mr-1 hidden lg:inline-flex" />
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={'end' in link ? link.end : undefined}
            className={desktopLinkClass}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 transition hover:border-blue-600 hover:text-white active:scale-95 md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              fill="currentColor"
              d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6Z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              fill="currentColor"
              d="M4 7h16v2H4V7Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"
            />
          </svg>
        )}
      </button>

      <MobileNavDrawer open={open} onClose={close} />
    </>
  )
}
