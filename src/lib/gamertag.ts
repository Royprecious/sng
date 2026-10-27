import { CLAN_TAG } from '../data/clan'

export function applyClanTagToName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return CLAN_TAG
  if (trimmed.startsWith(CLAN_TAG)) return trimmed
  let base = trimmed
  if (base.toLowerCase().startsWith('sg_')) {
    base = base.slice(3)
  }
  return `${CLAN_TAG}${base}`
}

/** Base name for edit forms (without clan tag prefix). */
export function nameWithoutClanTag(gamertag: string): string {
  if (gamertag.startsWith(CLAN_TAG)) {
    return gamertag.slice(CLAN_TAG.length)
  }
  if (gamertag.toLowerCase().startsWith('sg_')) {
    return gamertag.slice(3)
  }
  return gamertag
}

export function previewGamertag(name: string): string {
  try {
    return applyClanTagToName(name)
  } catch {
    return CLAN_TAG
  }
}
