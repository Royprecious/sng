import type { ReactNode } from 'react'

/** White stage light from above — wraps 1st-place column only. */
export function PodiumChampionSpotlight({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`podium-winner-column relative ${className}`.trim()}>
      <div className="podium-winner-light-bulb" aria-hidden />
      <div className="podium-winner-light-beam" aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
