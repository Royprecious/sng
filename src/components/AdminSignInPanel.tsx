import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CLAN_NAME } from '../data/clan'
import { ClanTag, ClanTagBadge } from './ClanTag'
import { CameroonBadge, CameroonStripe } from './CameroonStripe'

function GoogleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function CrosshairDecor({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      fill="none"
    >
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <circle
        cx="50"
        cy="50"
        r="28"
        stroke="currentColor"
        strokeWidth="0.4"
        opacity="0.25"
      />
      <line x1="50" y1="6" x2="50" y2="24" stroke="currentColor" strokeWidth="0.8" />
      <line x1="50" y1="76" x2="50" y2="94" stroke="currentColor" strokeWidth="0.8" />
      <line x1="6" y1="50" x2="24" y2="50" stroke="currentColor" strokeWidth="0.8" />
      <line x1="76" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="2" fill="#ce1126" />
    </svg>
  )
}

const accessTiers = [
  {
    label: 'Viewer',
    desc: 'Roster, tiers, tournament standings.',
    icon: '01',
    border: 'border-slate-600/60 hover:border-slate-500',
    bg: 'bg-slate-950/60',
    glow: 'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
    dot: 'bg-slate-400',
    text: 'text-slate-200',
  },
  {
    label: 'Admin',
    desc: 'Tournament edits after invite redeem.',
    icon: '02',
    border: 'border-blue-500/50 hover:border-blue-400/70',
    bg: 'bg-blue-950/40',
    glow: 'shadow-[0_0_24px_rgba(37,99,235,0.15)]',
    dot: 'bg-blue-400',
    text: 'text-blue-100',
  },
  {
    label: 'Clan Master',
    desc: 'Invite codes & full console.',
    icon: '03',
    border: 'border-cm-yellow/45 hover:border-cm-yellow/70',
    bg: 'bg-cm-yellow/[0.07]',
    glow: 'shadow-[0_0_28px_rgba(252,209,22,0.12)]',
    dot: 'bg-cm-yellow',
    text: 'text-cm-yellow',
  },
]

type AdminSignInPanelProps = {
  onSignIn: () => void
}

export function AdminSignInPanel({ onSignIn }: AdminSignInPanelProps) {
  return (
    <div className="relative mx-auto flex min-h-[min(85vh,52rem)] max-w-6xl flex-col justify-center py-6 sm:py-10">
      <CrosshairDecor className="pointer-events-none absolute -left-4 top-8 h-28 w-28 text-blue-500/25 sm:h-36 sm:w-36" />
      <CrosshairDecor className="pointer-events-none absolute -right-6 bottom-12 h-24 w-24 rotate-45 text-cm-green/20 sm:h-32 sm:w-32" />

      <section className="relative overflow-hidden rounded-3xl border border-blue-800/30 bg-[#040810]/90 shadow-[0_0_120px_rgba(37,99,235,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.35]" />
        <div className="pointer-events-none absolute inset-0 cm-glow" />
        <div className="admin-login-scanlines pointer-events-none absolute inset-0" />
        <div className="admin-login-orb pointer-events-none absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-blue-600/25 blur-[80px]" />
        <div className="admin-login-orb-delay pointer-events-none absolute -left-16 bottom-1/4 h-56 w-56 rounded-full bg-cm-red/15 blur-[70px]" />

        <div className="absolute inset-y-0 left-0 w-1.5 overflow-hidden rounded-l-3xl">
          <CameroonStripe size="md" vertical className="h-full min-h-full rounded-none" />
        </div>

        <CameroonStripe
          size="md"
          className="relative z-10 ml-1.5 rounded-none"
        />

        <div className="relative z-10 grid gap-12 p-6 pl-7 sm:p-10 sm:pl-11 lg:grid-cols-[1.15fr,min(100%,24rem)] lg:items-center lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-950/60 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.28em] text-blue-200 uppercase shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                </span>
                Command uplink
              </span>
              <CameroonBadge />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <ClanTagBadge />
              <p className="text-[10px] font-bold tracking-[0.5em] text-blue-500/80 uppercase sm:text-xs">
                {CLAN_NAME} · Admin
              </p>
            </div>

            <h1 className="mt-2 leading-[0.92]">
              <span className="block text-4xl font-black tracking-[0.06em] text-white drop-shadow-[0_0_32px_rgba(59,130,246,0.4)] sm:text-5xl lg:text-6xl">
                SNIPER
              </span>
              <span className="hero-gang-word mt-1 block text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                ACCESS
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
              Locked tools for the family that runs the board — tournament
              control, leader codes, and the clan master console.{' '}
              <span className="font-semibold text-slate-300">
                Google sign-in only.
              </span>
            </p>

            <ul className="mt-9 space-y-3">
              {accessTiers.map((tier) => (
                <li
                  key={tier.label}
                  className={`admin-tier-card flex items-start gap-4 rounded-xl border px-4 py-3.5 ${tier.border} ${tier.bg} ${tier.glow}`}
                >
                  <span className="font-mono text-[10px] font-bold tracking-widest text-slate-600">
                    {tier.icon}
                  </span>
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tier.dot} shadow-[0_0_8px_currentColor]`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-black tracking-[0.15em] uppercase ${tier.text}`}
                    >
                      {tier.label}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{tier.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              to="/"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-bold tracking-wide text-slate-500 uppercase transition hover:text-blue-400"
            >
              <span className="transition group-hover:-translate-x-0.5">←</span>
              Return to lobby
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
            <div className="admin-login-frame absolute -inset-[2px] rounded-[1.35rem] opacity-90" />
            <div className="relative overflow-hidden rounded-[1.25rem] border border-slate-700/50 bg-slate-950/95 p-7 shadow-2xl backdrop-blur-md sm:p-9">
              <div className="pointer-events-none absolute inset-0 admin-login-scanlines opacity-60" />
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 hierarchy-avatar-ring rounded-2xl opacity-80" />
                <div className="relative flex h-[calc(100%-4px)] w-[calc(100%-4px)] items-center justify-center rounded-[0.65rem] bg-slate-950">
                  <ClanTag size="sm" className="text-base sm:text-lg" />
                </div>
              </div>

              <p className="relative mt-6 text-center font-mono text-[10px] tracking-[0.35em] text-slate-600 uppercase">
                Auth · OAuth 2.0
              </p>
              <h2 className="relative mt-2 text-center text-2xl font-black text-white">
                Identify yourself
              </h2>
              <p className="relative mt-2 text-center text-sm leading-relaxed text-slate-500">
                Use the Google account your leadership recognizes.
              </p>

              <button
                type="button"
                onClick={onSignIn}
                className="admin-google-shine group relative mt-9 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-black tracking-wide text-slate-900 uppercase shadow-[0_8px_40px_rgba(255,255,255,0.12)] transition hover:scale-[1.02] hover:bg-slate-50 hover:shadow-[0_12px_48px_rgba(255,255,255,0.18)] active:scale-[0.98]"
              >
                <GoogleIcon className="relative z-10 h-5 w-5 transition group-hover:scale-110" />
                <span className="relative z-10">Continue with Google</span>
              </button>

              <div className="relative mt-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                <span className="text-[9px] font-bold tracking-[0.2em] text-slate-600 uppercase">
                  Clan only
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              </div>

              <p className="relative mt-4 text-center text-[11px] leading-relaxed text-slate-600">
                Need edit access? Sign in first, then redeem an invite code from
                the Clan Master.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

type AdminSetupPanelProps = {
  children: ReactNode
}

export function AdminSetupPanel({ children }: AdminSetupPanelProps) {
  return (
    <section className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-amber-900/40 bg-slate-950/90 p-8 shadow-[0_0_60px_rgba(245,158,11,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="admin-login-scanlines pointer-events-none absolute inset-0" />
      <div className="relative">
        <p className="text-xs font-bold tracking-[0.25em] text-amber-500 uppercase">
          Setup required
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Admin & login</h1>
        <CameroonStripe size="md" className="mt-4 max-w-[8rem] rounded-full" />
        <div className="mt-4 text-slate-400">{children}</div>
      </div>
    </section>
  )
}
