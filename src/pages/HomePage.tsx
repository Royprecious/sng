import { Link } from 'react-router-dom'
import { CameroonBadge, CameroonStripe } from '../components/CameroonStripe'
import { GamingButton } from '../components/GamingButton'
import { HeroBrand } from '../components/HeroBrand'
import { SngMemberCard } from '../components/SngMemberCard'
import { CLAN_NAME, getLeadershipSlotHolders } from '../data/clan'
import { useClan } from '../context/ClanContext'

export function HomePage() {
  const { soldiers } = useClan()
  const featured = soldiers.slice(0, 3)

  const holders = getLeadershipSlotHolders(soldiers)
  const leadershipFilled = [
    holders.master,
    holders.mistress,
    holders.vice,
    ...holders.coordinators,
  ].filter(Boolean).length
  const combatRolesFilled = new Set(soldiers.map((s) => s.combatRole)).size

  const stats = [
    { label: 'Active soldiers', value: String(soldiers.length) },
    { label: 'High command filled', value: `${leadershipFilled}/6` },
    {
      label: 'Combat roles filled',
      value:
        soldiers.length === 0 ? 'All open' : `${combatRolesFilled}/4`,
    },
    { label: 'Home base', value: 'Cameroon' },
  ]

  return (
    <>
      <section className="relative page-shell mx-auto min-w-0 max-w-7xl overflow-x-hidden pb-12 pt-8 sm:pb-16 sm:pt-12 lg:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(720px,85vh)] overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern-home opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,transparent_20%,#060b14_88%)]" />
        </div>
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-blue-300 uppercase">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                Cod Mobile Clan
              </p>
              <CameroonBadge />
            </div>
            <HeroBrand />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              More than a tag on your name we&apos;re siblings in the lobby:
              late-night scrims, inside jokes, and someone always down to run
              one more match. We still love precision snipes and clean wins, and
              we carry{' '}
              <span className="font-semibold text-cm-green">green</span>,{' '}
              <span className="font-semibold text-cm-red">red</span>, and{' '}
              <span className="font-semibold text-cm-yellow">yellow</span>{' '}
              with pride. Check the tier board, meet the soldiers, or tally
              tournament points when it&apos;s go time.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap">
              <GamingButton
                to="/soldiers"
                className="min-[480px]:text-left"
              >
                Meet the family
              </GamingButton>
              <GamingButton
                to="/tournament"
                variant="secondary"
                className="min-[480px]:text-left"
              >
                Tournament calc
              </GamingButton>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-blue-600/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-blue-800/50 bg-slate-900/90 p-5 sm:p-8">
              <CameroonStripe size="md" className="absolute inset-x-0 top-0 rounded-none" />
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 pt-2">
                <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">
                  Live clan status
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                  RECRUITING
                </span>
              </div>
              <ul className="mt-6 space-y-4">
                {stats.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between rounded-lg bg-slate-950/60 px-4 py-3"
                  >
                    <span className="text-sm text-slate-400">{s.label}</span>
                    <span className="text-xl font-black text-blue-300">
                      {s.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-slate-800/80 bg-slate-950/50 py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1 cm-card-top opacity-80 lg:block" />
        <div className="page-shell mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Featured soldiers
              </h2>
              <p className="mt-2 text-slate-400">
                Core operators holding the line for {CLAN_NAME}.
              </p>
            </div>
            <Link
              to="/soldiers"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Shareable member cards →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center text-slate-500">
              No soldiers yet. Check back once the roster is filled.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((s) => (
                <SngMemberCard key={s.id} soldier={s} compactActions />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-shell mx-auto max-w-7xl pb-12 sm:pb-16">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/members"
            className="group rounded-xl border border-slate-800 bg-linear-to-br from-slate-900 to-blue-950/40 p-6 transition hover:border-blue-600/40 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white group-hover:text-blue-200">
              Members & hierarchy
            </h3>
            <p className="mt-2 text-slate-400">
              Clan Master, Mistress, Vice Master, three Coordinators, and the
              full roster table.
            </p>
          </Link>
          <Link
            to="/tiers"
            className="group rounded-xl border border-slate-800 bg-linear-to-br from-slate-900 to-blue-950/40 p-6 transition hover:border-blue-600/40 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white group-hover:text-blue-200">
              Tier board
            </h3>
            <p className="mt-2 text-slate-400">
              T1 through T5 every member has a tier. See who sits where and
              what it takes to climb.
            </p>
          </Link>
          <Link
            to="/tournament"
            className="group rounded-xl border border-slate-800 bg-linear-to-br from-slate-900 to-blue-950/40 p-6 transition hover:border-blue-600/40 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white group-hover:text-blue-200">
              Tournament calculator
            </h3>
            <p className="mt-2 text-slate-400">
              Set kill and placement points, log every match, and auto-rank
              teams and players across the series.
            </p>
          </Link>
        </div>
      </section>
    </>
  )
}
