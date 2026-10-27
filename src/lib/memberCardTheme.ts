import type { ClanRank, Soldier } from '../data/clan'

export type MemberCardVisual =
  | 'master'
  | 'mistress'
  | 'vice'
  | 'coordinator'
  | 'member'

export function memberCardVisualForRank(rank: ClanRank): MemberCardVisual {
  switch (rank) {
    case 'clan_master':
      return 'master'
    case 'clan_mistress':
      return 'mistress'
    case 'vice_clan_master':
      return 'vice'
    case 'clan_coordinator':
      return 'coordinator'
    default:
      return 'member'
  }
}

export function memberCardVisualForSoldier(s: Soldier): MemberCardVisual {
  return memberCardVisualForRank(s.clanRank)
}

export const memberCardBorderClass: Record<MemberCardVisual, string> = {
  master: 'hierarchy-card-border-master',
  mistress: 'hierarchy-card-border-mistress',
  vice: 'hierarchy-card-border-vice',
  coordinator: 'hierarchy-card-border-coordinator',
  member: 'hierarchy-card-border-member',
}

export const memberCardStyles: Record<
  MemberCardVisual,
  {
    inner: string
    badge: string
    corner: string
    avatarWrap: string
    avatar: string
  }
> = {
  master: {
    inner:
      'shadow-[inset_0_1px_0_rgba(252,209,22,0.15),0_24px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(252,209,22,0.08)]',
    badge: 'bg-cm-yellow/10 text-cm-yellow ring-cm-yellow/50',
    corner: 'border-cm-yellow/70',
    avatarWrap:
      'hierarchy-avatar-ring p-[3px]',
    avatar: 'h-28 w-28 text-3xl sm:h-32 sm:w-32',
  },
  mistress: {
    inner: 'shadow-[inset_0_1px_0_rgba(206,17,38,0.12),0_16px_40px_rgba(0,0,0,0.45)]',
    badge: 'bg-cm-red/10 text-rose-100 ring-cm-red/45',
    corner: 'border-cm-red/55',
    avatarWrap: 'ring-2 ring-cm-red/45 ring-offset-2 ring-offset-slate-950',
    avatar: 'h-24 w-24 text-2xl sm:h-28 sm:w-28',
  },
  vice: {
    inner: 'shadow-[inset_0_1px_0_rgba(59,130,246,0.15),0_16px_40px_rgba(0,0,0,0.4)]',
    badge: 'bg-blue-600/15 text-blue-100 ring-blue-500/45',
    corner: 'border-blue-400/55',
    avatarWrap: 'ring-2 ring-blue-500/40 ring-offset-2 ring-offset-slate-950',
    avatar: 'h-24 w-24 text-2xl sm:h-28 sm:w-28',
  },
  coordinator: {
    inner:
      'shadow-[inset_0_1px_0_rgba(0,122,94,0.1),0_8px_24px_rgba(0,0,0,0.35)]',
    badge: 'bg-cm-green/10 text-emerald-100 ring-cm-green/40',
    corner: 'border-cm-green/45',
    avatarWrap: 'ring-1 ring-cm-green/35 ring-offset-1 ring-offset-slate-950',
    avatar: 'h-20 w-20 text-xl sm:h-24 sm:w-24',
  },
  member: {
    inner:
      'shadow-[inset_0_1px_0_rgba(59,130,246,0.12),0_12px_32px_rgba(0,0,0,0.4),0_0_48px_rgba(37,99,235,0.08)]',
    badge: 'bg-blue-600/15 text-blue-100 ring-blue-500/40',
    corner: 'border-blue-400/50',
    avatarWrap: 'ring-2 ring-blue-500/35 ring-offset-2 ring-offset-[#040810]',
    avatar: 'h-24 w-24 text-2xl sm:h-28 sm:w-28',
  },
}
