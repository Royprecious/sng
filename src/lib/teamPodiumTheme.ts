export type PodiumRank = 1 | 2 | 3

export const podiumRankTheme: Record<
  PodiumRank,
  {
    placementLabel: string
    medal: string
    borderGradient: string
    innerGlow: string
    accentText: string
    rankBadge: string
  }
> = {
  1: {
    placementLabel: 'Champion',
    medal: '🥇',
    borderGradient:
      'bg-linear-to-br from-amber-200 via-yellow-400 to-amber-800',
    innerGlow: 'shadow-[inset_0_0_50px_rgba(251,191,36,0.18)]',
    accentText: 'text-amber-100',
    rankBadge: 'bg-amber-400/15 text-amber-100 ring-amber-300/60',
  },
  2: {
    placementLabel: '2nd place',
    medal: '🥈',
    borderGradient:
      'bg-linear-to-br from-slate-200 via-slate-400 to-slate-600',
    innerGlow: 'shadow-[inset_0_0_40px_rgba(148,163,184,0.12)]',
    accentText: 'text-slate-200',
    rankBadge: 'bg-slate-400/20 text-slate-200 ring-slate-400/40',
  },
  3: {
    placementLabel: '3rd place',
    medal: '🥉',
    borderGradient:
      'bg-linear-to-br from-orange-300 via-amber-700 to-orange-950',
    innerGlow: 'shadow-[inset_0_0_40px_rgba(180,83,9,0.15)]',
    accentText: 'text-orange-200',
    rankBadge: 'bg-orange-600/20 text-orange-200 ring-orange-500/40',
  },
}
