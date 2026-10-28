import { useRef, useState } from 'react'
import type { Soldier } from '../data/clan'
import { CLAN_TAG } from '../data/clan'
import {
  downloadMemberCardPng,
  shareMemberCardPng,
} from '../lib/exportMemberCardPng'
import { GamingButton } from './GamingButton'
import { SngMemberCardFace } from './SngMemberCardFace'

type SngMemberCardProps = {
  soldier: Soldier
  editable?: boolean
  onEdit?: (soldier: Soldier) => void
  /** Hide save/share actions (e.g. home featured strip). */
  compactActions?: boolean
}

export function SngMemberCard({
  soldier,
  editable,
  onEdit,
  compactActions = false,
}: SngMemberCardProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const canEdit = editable && onEdit

  async function runExport(mode: 'share' | 'download') {
    const node = exportRef.current
    if (!node || busy) return
    setBusy(true)
    setHint(null)
    try {
      const title = `${soldier.gamertag} · ${CLAN_TAG}`
      if (mode === 'share') {
        const result = await shareMemberCardPng(node, soldier.gamertag, title)
        setHint(
          result === 'shared'
            ? 'Shared!'
            : 'Saved to your device — share from photos.',
        )
      } else {
        await downloadMemberCardPng(node, soldier.gamertag)
        setHint('Downloaded PNG')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setHint(err instanceof Error ? err.message : 'Could not export card')
    } finally {
      setBusy(false)
      window.setTimeout(() => setHint(null), 4000)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {canEdit ? (
          <button
            type="button"
            onClick={() => onEdit(soldier)}
            className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
          >
            <SngMemberCardFace soldier={soldier} />
            <span className="pointer-events-none absolute right-4 top-14 text-[10px] font-bold tracking-wider text-cm-yellow/90 uppercase opacity-0 transition group-hover:opacity-100">
              Edit profile
            </span>
          </button>
        ) : (
          <SngMemberCardFace soldier={soldier} />
        )}
      </div>

      {!compactActions && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <GamingButton
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => void runExport('share')}
              className="touch-manipulation btn-gaming-block"
            >
              {busy ? '…' : 'Share card'}
            </GamingButton>
            <GamingButton
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void runExport('download')}
              className="touch-manipulation btn-gaming-block"
            >
              Save image
            </GamingButton>
          </div>
          <p className="text-center text-[10px] text-slate-500">
            PNG for WhatsApp, Instagram, or your gallery
          </p>
          {hint && (
            <p className="text-center text-xs font-semibold text-emerald-400">
              {hint}
            </p>
          )}
        </div>
      )}

      {/* Off-screen clone for crisp export (fixed width) */}
      <div
        className="export-capture-host"
        aria-hidden
        inert
      >
        <SngMemberCardFace
          ref={exportRef}
          soldier={soldier}
          exportLayout
        />
      </div>
    </div>
  )
}

/** @deprecated Use SngMemberCard */
export function SoldierCard(props: SngMemberCardProps) {
  return <SngMemberCard {...props} />
}
