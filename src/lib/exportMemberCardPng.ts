import { toPng } from 'html-to-image'
import { nameWithoutClanTag } from './gamertag'

function safeFilename(gamertag: string): string {
  const base = nameWithoutClanTag(gamertag).replace(/[^\w.-]+/g, '_')
  return `Sng-${base || 'member'}.png`
}

export function safeExportFilename(label: string): string {
  const base = label.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_')
  return `Sng-${base || 'export'}.png`
}

export async function captureElementAsPng(
  node: HTMLElement,
): Promise<string> {
  const width = Math.ceil(node.getBoundingClientRect().width)
  const height = Math.ceil(node.getBoundingClientRect().height)
  if (width < 48 || height < 48) {
    throw new Error(
      'Card export failed — layout was not rendered at full size. Refresh and try again.',
    )
  }
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#040810',
    width,
    height,
  })
}

/** Phones/tablets: Web Share saves reliably; anchor download often opens a broken preview. */
function prefersNativeShareSave(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return true
  if (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.platform)) return true
  return /Android/i.test(ua)
}

async function pngBlobFromNode(node: HTMLElement): Promise<Blob> {
  const dataUrl = await captureElementAsPng(node)
  return (await fetch(dataUrl)).blob()
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

async function sharePngBlob(
  blob: Blob,
  filename: string,
  title: string,
): Promise<boolean> {
  const file = new File([blob], filename, { type: 'image/png' })
  if (typeof navigator.share !== 'function') return false
  const payload: ShareData = { files: [file], title, text: title }
  if (navigator.canShare && !navigator.canShare(payload)) return false
  await navigator.share(payload)
  return true
}

/**
 * Best save path for export UI: share sheet on iOS/Android, file download on desktop.
 */
export async function saveExportPng(
  node: HTMLElement,
  filenameBase: string,
  title: string,
): Promise<'shared' | 'saved'> {
  const filename = safeExportFilename(filenameBase)
  const blob = await pngBlobFromNode(node)

  const mobile = prefersNativeShareSave()

  if (typeof navigator.share === 'function') {
    try {
      const shared = await sharePngBlob(blob, filename, title)
      if (shared) return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err
    }
  }

  if (mobile) {
    throw new Error(
      'Saving failed on this device. Try again from Safari (not in-app browser), or update iOS.',
    )
  }

  downloadBlob(blob, filename)
  return 'saved'
}

export async function downloadMemberCardPng(
  node: HTMLElement,
  gamertag: string,
): Promise<void> {
  const filename = safeFilename(gamertag)
  const blob = await pngBlobFromNode(node)
  if (prefersNativeShareSave()) {
    try {
      const shared = await sharePngBlob(blob, filename, `${gamertag} member card`)
      if (shared) return
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err
    }
  }
  downloadBlob(blob, filename)
}

export async function shareMemberCardPng(
  node: HTMLElement,
  gamertag: string,
  title: string,
): Promise<'shared' | 'downloaded'> {
  const filename = safeFilename(gamertag)
  const blob = await pngBlobFromNode(node)
  try {
    const shared = await sharePngBlob(blob, filename, title)
    if (shared) return 'shared'
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err
  }
  downloadBlob(blob, filename)
  return 'downloaded'
}

/** @deprecated use saveExportPng */
export async function downloadCardPng(
  node: HTMLElement,
  filenameBase: string,
): Promise<void> {
  await saveExportPng(node, filenameBase, filenameBase)
}

export async function shareCardPng(
  node: HTMLElement,
  filenameBase: string,
  title: string,
): Promise<'shared' | 'downloaded'> {
  const result = await saveExportPng(node, filenameBase, title)
  return result === 'shared' ? 'shared' : 'downloaded'
}
