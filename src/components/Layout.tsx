import { Outlet, useLocation } from 'react-router-dom'
import { useClan } from '../context/ClanContext'
import { CLAN_NAME, CLAN_TAG } from '../data/clan'
import { CameroonStripe } from './CameroonStripe'
import { Logo } from './Logo'
import { AuthButton } from './AuthButton'
import { SiteNav } from './SiteNav'

export function Layout() {
  const { apiConnected } = useClan()
  const isHome = useLocation().pathname === '/'
  return (
    <div className="relative min-h-dvh">
      <CameroonStripe size="md" className="fixed top-0 z-[60] rounded-none" />
      <div
        className={`pointer-events-none fixed inset-0 ${
          isHome
            ? 'bg-grid-pattern-home opacity-[0.72]'
            : 'bg-grid-pattern opacity-40'
        }`}
      />
      <div
        className={`pointer-events-none fixed inset-0 cm-glow ${isHome ? 'opacity-75' : ''}`}
      />
      <div
        className={`pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.35),transparent)] ${isHome ? 'opacity-55' : ''}`}
      />

      <header className="site-header sticky top-0 z-50 border-b border-blue-950/80 bg-slate-950/95 pt-1.5 max-md:backdrop-blur-none md:bg-slate-950/85 md:backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <AuthButton />
            <SiteNav />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <Outlet />
      </main>

      <footer className="site-footer relative z-10 mt-10 border-t border-slate-800/80 bg-slate-950/90 sm:mt-16">
        <CameroonStripe size="md" className="rounded-none opacity-90" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 sm:py-8">
          <Logo compact />
          <p className="max-w-lg text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${apiConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}
              title={apiConnected ? 'API connected' : 'API offline'}
            />
            © {new Date().getFullYear()} {CLAN_NAME}{' '}
            <span className="font-bold text-blue-300">{CLAN_TAG}</span> {' '}
            <span className="text-cm-yellow/90">Green · Red · Yellow</span>{' '}
            pride.
            <span className="hidden sm:inline"> </span>
            <span className="mt-1 block sm:mt-0 sm:inline">
              Precision. Discipline. Domination.
            </span>
          </p>
        </div>
      </footer>
    </div>
  )
}
