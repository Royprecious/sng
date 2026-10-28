import { CLAN_NAME } from '../data/clan'
import { ClanTag, ClanTagBadge } from './ClanTag'

export function HeroBrand() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -left-2 top-1/2 h-32 w-32 -translate-y-1/2 opacity-40 sm:h-40 sm:w-40"
        aria-hidden
      >
        <svg viewBox="0 0 100 100" className="h-full w-full text-blue-500/30">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
          />
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <line
            x1="50"
            y1="4"
            x2="50"
            y2="22"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="50"
            y1="78"
            x2="50"
            y2="96"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="4"
            y1="50"
            x2="22"
            y2="50"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="78"
            y1="50"
            x2="96"
            y2="50"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="50" cy="50" r="2.5" fill="#ce1126" />
        </svg>
      </div>

      <div className="relative flex flex-wrap items-center gap-3">
        <ClanTagBadge />
        <p className="text-[10px] font-bold tracking-[0.45em] text-blue-400/90 uppercase sm:text-xs">
          Cod mobile family
        </p>
      </div>

      <div className="relative mt-4">
        <ClanTag size="hero" className="leading-none" />
      </div>

      <h1 className="relative mt-2 leading-[0.95]">
        <span className="block text-[2rem] font-black tracking-[0.06em] text-white drop-shadow-[0_0_28px_rgba(59,130,246,0.35)] min-[400px]:text-4xl sm:text-6xl lg:text-7xl">
          SNIPER
        </span>
        <span className="hero-gang-word mt-1 block text-[2rem] font-black tracking-tight min-[400px]:text-4xl sm:text-6xl lg:text-7xl">
          GANG
        </span>
      </h1>

      <div className="relative mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
        <span className="hero-tagline-pill rounded-full border border-cm-yellow/35 bg-cm-yellow/10 px-3 py-1 text-[11px] font-bold tracking-widest text-cm-yellow uppercase">
          One family
        </span>
        <span className="hero-tagline-pill rounded-full border border-blue-500/30 bg-blue-950/50 px-3 py-1 text-[11px] font-bold tracking-widest text-blue-200 uppercase">
          All fun
        </span>
      </div>
      <p className="relative mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
        We grind ranked and tournaments hard but {CLAN_NAME} is really about{' '}
        <span className="font-semibold text-white">laughing in voice chat</span>
        , backing each other up, and building a{' '}
        <span className="font-semibold text-blue-300">Cameroon-rooted family</span>{' '}
        that wins together.
      </p>
    </div>
  )
}
