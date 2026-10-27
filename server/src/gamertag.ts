export const CLAN_TAG = 'Sngঔ'

/** Prefix clan tag; input "vortex" → "Sngঔvortex". Idempotent if tag already present. */
export function applyClanTagToName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('Soldier name is required')
  }
  if (trimmed.startsWith(CLAN_TAG)) {
    return trimmed
  }
  let base = trimmed
  if (base.toLowerCase().startsWith('sg_')) {
    base = base.slice(3)
  }
  if (base.startsWith(CLAN_TAG)) {
    return base
  }
  return `${CLAN_TAG}${base}`
}

export function avatarFromGamertag(gamertag: string): string {
  const base = gamertag.startsWith(CLAN_TAG)
    ? gamertag.slice(CLAN_TAG.length)
    : gamertag.replace(/^SG_/i, '')
  const letters = base.replace(/[^a-zA-Z0-9]/g, '')
  if (letters.length >= 2) {
    return letters.slice(0, 2).toUpperCase()
  }
  if (letters.length === 1) {
    return `${letters.toUpperCase()}?`
  }
  return '??'
}
