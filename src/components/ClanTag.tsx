import { CLAN_NAME, CLAN_TAG } from '../data/clan'

type ClanTagProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'hero'
  as?: 'span' | 'div'
}

const sizeClass = {
  sm: 'text-sm',
  md: 'text-lg font-black',
  lg: 'text-2xl font-black sm:text-3xl',
  hero: 'text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.75rem]',
}

export function ClanTag({
  className = '',
  size = 'md',
  as: Tag = 'span',
}: ClanTagProps) {
  return (
    <Tag
      className={`inline-block bg-gradient-to-r from-blue-300 via-white to-cm-yellow bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.35)] ${sizeClass[size]} ${className}`}
      title={`${CLAN_NAME} clan tag`}
    >
      {CLAN_TAG}
    </Tag>
  )
}

export function ClanTagBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-blue-500/40 bg-slate-950/80 px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-blue-200 shadow-[0_0_16px_rgba(37,99,235,0.25)] sm:text-sm ${className}`}
    >
      {CLAN_TAG}
    </span>
  )
}
