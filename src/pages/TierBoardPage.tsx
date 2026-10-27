import { Link } from 'react-router-dom'
import { EmptyRosterMessage } from '../components/EmptyRosterMessage'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import { SoldierPortrait } from '../components/SoldierPortrait'
import { useClan } from '../context/ClanContext'
import {
  CLAN_NAME,
  CLAN_TAG,
  formatCombatRole,
  formatTierLabel,
  getClanRankLabel,
  sortSoldiersByHierarchy,
  tiers,
  type Soldier,
  type TierDefinition,
} from '../data/clan'

function TierSummaryStrip({ soldiers }: { soldiers: Soldier[] }) {
  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950/50 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-blue-900/25">
      <div className="cm-card-top h-1 w-full" />
      <div className="relative bg-slate-950/80 p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.06]" />
        <p className="relative text-center text-[10px] font-bold tracking-[0.35em] text-blue-400 uppercase">
          Climb path · T5 recruits → T1 elite
        </p>
        <div className="relative mt-4 flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
          {tiers.map((tier) => {
            const count = soldiers.filter((s) => s.tier === tier.id).length
            return (
              <a
                key={tier.id}
                href={`#tier-${tier.id}`}
                className={`group flex min-w-[5.5rem] flex-1 flex-col items-center rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-3 transition sm:max-w-[8rem] ${tier.boardHover}`}
              >
                <span
                  className={`rounded-lg bg-linear-to-br px-2.5 py-1 text-sm font-black text-white shadow-lg ${tier.color} ${tier.glow}`}
                >
                  {tier.code}
                </span>
                <span
                  className={`mt-2 text-[10px] font-bold tracking-wide uppercase ${tier.boardAccent}`}
                >
                  {tier.label.replace('Tier ', 'T')}
                </span>
                <span className={`mt-1 text-lg font-black ${tier.boardAccent}`}>
                  {count}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TierMemberRow({
  member,
  index,
  tier,
}: {
  member: Soldier
  index: number
  tier: TierDefinition
}) {
  return (
    <li
      className={`group relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 transition sm:p-4 ${tier.boardHover}`}
    >
      <div className="pointer-events-none absolute inset-0 hierarchy-card-scanlines opacity-30" />
      <div className="relative flex items-center gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/40 text-xs font-black ${tier.boardAccent}`}
        >
          {index + 1}
        </span>
        <SoldierPortrait
          initials={member.avatar}
          tierId={member.tier}
          combatRole={member.combatRole}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white group-hover:text-blue-100">
            {member.gamertag}
          </p>
          <p className="truncate text-xs text-slate-500">
            {getClanRankLabel(member.clanRank)} · {member.role}
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className={`text-xs font-bold ${tier.boardAccent}`}>
            {formatCombatRole(member.combatRole)}
          </p>
          <p className="text-[10px] text-slate-500">{member.region}</p>
        </div>
      </div>
    </li>
  )
}

function TierSection({
  tier,
  members,
}: {
  tier: TierDefinition
  members: Soldier[]
}) {
  const sorted = [...members].sort(sortSoldiersByHierarchy)

  return (
    <section
      id={`tier-${tier.id}`}
      className={`scroll-mt-24 overflow-hidden rounded-2xl p-px shadow-[0_16px_48px_rgba(0,0,0,0.35)] ${tier.boardFrame}`}
    >
      <div className="overflow-hidden rounded-[calc(1rem-1px)] bg-slate-950">
      <div
        className={`relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${tier.boardHeader} px-4 py-5 sm:px-6`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.15),transparent_50%,rgba(255,255,255,0.08))]" />
        <div className="relative min-w-0">
          <p className="text-[10px] font-bold tracking-[0.3em] text-white/75 uppercase">
            {tier.label}
          </p>
          <h2 className="text-2xl font-black text-white drop-shadow-sm sm:text-3xl">
            {tier.code}
            <span className="ml-2 text-lg font-bold text-white/80 sm:text-xl">
              · {formatTierLabel(tier.id)}
            </span>
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90">
            {tier.description}
          </p>
          <p className="mt-2 text-xs font-semibold text-white/75">
            {members.length} operator{members.length === 1 ? '' : 's'} on this
            tier
          </p>
        </div>
        <div className="relative w-fit shrink-0 rounded-xl border border-white/15 bg-black/30 px-4 py-3 backdrop-blur-sm sm:text-right">
          <p className="text-[10px] font-bold tracking-wider text-white/70 uppercase">
            Min. clan pts
          </p>
          <p className="text-2xl font-black tabular-nums text-white">
            {tier.minPoints.toLocaleString()}
          </p>
        </div>
      </div>

      <div className={`relative border-t border-white/5 p-4 sm:p-6 ${tier.boardBody}`}>
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.04]" />
        {sorted.length === 0 ? (
          <div className="relative rounded-xl border border-dashed border-slate-700/80 bg-slate-950/50 px-6 py-10 text-center">
            <p className="text-sm font-bold tracking-wide text-slate-400 uppercase">
              No operators here yet
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Grind scrims and clan events to climb into {tier.label}.
            </p>
          </div>
        ) : (
          <ul className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((m, i) => (
              <TierMemberRow key={m.id} member={m} index={i} tier={tier} />
            ))}
          </ul>
        )}
      </div>
      </div>
    </section>
  )
}

export function TierBoardPage() {
  const { soldiers, loading } = useClan()
  const rosterEmpty = !loading && soldiers.length === 0

  return (
    <PageShell>
      <PageHeader eyebrow="Hierarchy" title="Tier board">
        Every {CLAN_NAME} member sits on{' '}
        <strong className="text-white">Tier 1</strong> through{' '}
        <strong className="text-white">Tier 5</strong> Tier 1 is the highest.
        Move up with scrims, ranked, and tournament results. Tap a tier above to
        jump, or grab your{' '}
        <Link to="/soldiers" className="font-semibold text-blue-400 hover:text-blue-300">
          shareable member card
        </Link>{' '}
        on the roster page.
      </PageHeader>

      {loading && (
        <p className="mb-8 text-sm text-slate-500">Loading roster…</p>
      )}

      {rosterEmpty && <EmptyRosterMessage className="mb-10" />}

      {!rosterEmpty && (
        <>
          <TierSummaryStrip soldiers={soldiers} />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              <span className="font-bold text-blue-300">{CLAN_TAG}</span> ·{' '}
              {soldiers.length} on the board
            </p>
            <Link
              to="/soldiers"
              className="text-xs font-bold tracking-wide text-blue-400 uppercase hover:text-blue-300"
            >
              Roster & cards →
            </Link>
          </div>

          <div className="space-y-10">
            {tiers.map((tier) => (
              <TierSection
                key={tier.id}
                tier={tier}
                members={soldiers.filter((s) => s.tier === tier.id)}
              />
            ))}
          </div>
        </>
      )}
    </PageShell>
  )
}
