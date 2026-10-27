type CameroonStripeProps = {
  className?: string
  size?: 'sm' | 'md'
  vertical?: boolean
  /** White stage light on the flag (podium champion). */
  spotlight?: boolean
}

export function CameroonStripe({
  className = '',
  size = 'sm',
  vertical = false,
  spotlight = false,
}: CameroonStripeProps) {
  const thickness = size === 'sm' ? (vertical ? 'w-1' : 'h-1') : vertical ? 'w-1.5' : 'h-1.5'
  const thickSpotlight = spotlight && !vertical ? 'h-2 sm:h-2.5' : thickness

  const stripe = (
    <div
      className={`relative z-[1] flex overflow-hidden ${spotlight && !vertical ? 'podium-flag-lit rounded-sm' : 'rounded-full'} ${vertical ? 'h-full min-h-[3rem] flex-col' : 'w-full'} ${thickSpotlight} ${className}`}
      aria-hidden
      title="Cameroon"
    >
      <span className={`bg-cm-green ${vertical ? 'flex-1' : 'flex-1'}`} />
      <span className={`bg-cm-red ${vertical ? 'flex-1' : 'flex-1'}`} />
      <span className={`bg-cm-yellow ${vertical ? 'flex-1' : 'flex-1'}`} />
    </div>
  )

  if (!spotlight || vertical) return stripe

  return (
    <div className="podium-flag-bar relative w-full">
      {stripe}
      <div className="podium-flag-shine absolute inset-0 z-[3] rounded-sm" aria-hidden />
    </div>
  )
}

export function CameroonBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-cm-green/40 bg-cm-green/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-cm-yellow uppercase ${className}`}
    >
      <CameroonStar className="h-3.5 w-3.5 text-cm-yellow" />
      Cameroon
    </span>
  )
}

export function CameroonStar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2l2.35 7.22H22l-6.17 4.48 2.35 7.22L12 16.45l-6.18 4.47 2.35-7.22L2 9.22h7.65L12 2z"
      />
    </svg>
  )
}
