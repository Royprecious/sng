import { Link } from 'react-router-dom'
import { CLAN_NAME, CLAN_TAG } from '../data/clan'

type LogoProps = {
  compact?: boolean
}

export function Logo({ compact }: LogoProps) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-3"
      aria-label={`${CLAN_NAME} ${CLAN_TAG}`}
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-lg bg-blue-600/30 blur-md transition group-hover:bg-blue-500/40" />
        <svg
          viewBox="0 0 64 64"
          className="relative h-11 w-11 drop-shadow-[0_0_12px_rgba(59,130,246,0.65)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="sg-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="10"
            fill="#0a1628"
            stroke="url(#sg-logo-grad)"
            strokeWidth="2"
          />
          <circle
            cx="32"
            cy="32"
            r="18"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <circle
            cx="32"
            cy="32"
            r="10"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1"
            opacity="0.7"
          />
          <line
            x1="32"
            y1="8"
            x2="32"
            y2="18"
            stroke="#93c5fd"
            strokeWidth="1.5"
          />
          <line
            x1="32"
            y1="46"
            x2="32"
            y2="56"
            stroke="#93c5fd"
            strokeWidth="1.5"
          />
          <line
            x1="8"
            y1="32"
            x2="18"
            y2="32"
            stroke="#93c5fd"
            strokeWidth="1.5"
          />
          <line
            x1="46"
            y1="32"
            x2="56"
            y2="32"
            stroke="#93c5fd"
            strokeWidth="1.5"
          />
          <circle cx="32" cy="32" r="3" fill="#CE1126" />
          <path
            d="M32 32 L48 24"
            stroke="#FCD116"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <text
            x="32"
            y="37"
            textAnchor="middle"
            fill="url(#sg-logo-grad)"
            fontSize="9"
            fontWeight="800"
            fontFamily="Oxanium, system-ui, sans-serif"
          >
            Sng
          </text>
        </svg>
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <span className="block truncate text-base font-bold tracking-tight text-white group-hover:text-blue-100 sm:text-lg">
            Sniper<span className="text-blue-400">Gang</span>
          </span>
          <span className="hidden text-[10px] font-semibold tracking-[0.12em] min-[400px]:block sm:tracking-[0.15em]">
            <span className="font-bold text-blue-300">{CLAN_TAG}</span>
            <span className="text-slate-600"> · </span>
            <span className="text-cm-green">CM</span>
            <span className="text-slate-600"> · </span>
            <span className="text-blue-500/90">COD Mobile</span>
          </span>
        </div>
      )}
    </Link>
  )
}
