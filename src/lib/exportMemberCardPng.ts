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
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#040810',
  })
}

export async function downloadMemberCardPng(
  node: HTMLElement,
  gamertag: string,
): Promise<void> {
  const dataUrl = await captureElementAsPng(node)
  const link = document.createElement('a')
  link.download = safeFilename(gamertag)
  link.href = dataUrl
  link.click()
}

export async function shareMemberCardPng(
  node: HTMLElement,
  gamertag: string,
  title: string,
): Promise<'shared' | 'downloaded'> {
  const dataUrl = await captureElementAsPng(node)
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const file = new File([blob], safeFilename(gamertag), { type: 'image/png' })

  if (
    typeof navigator.share === 'function' &&
    (!navigator.canShare || navigator.canShare({ files: [file] }))
  ) {
    try {
      await navigator.share({
        files: [file],
        title,
        text: title,
      })
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err
      }
    }
  }

  await downloadMemberCardPng(node, gamertag)
  return 'downloaded'
}

export async function downloadCardPng(
  node: HTMLElement,
  filenameBase: string,
): Promise<void> {
  const dataUrl = await captureElementAsPng(node)
  const link = document.createElement('a')
  link.download = safeExportFilename(filenameBase)
  link.href = dataUrl
  link.click()
}

export async function shareCardPng(
  node: HTMLElement,
  filenameBase: string,
  title: string,
): Promise<'shared' | 'downloaded'> {
  const dataUrl = await captureElementAsPng(node)
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const file = new File([blob], safeExportFilename(filenameBase), {
    type: 'image/png',
  })

  if (
    typeof navigator.share === 'function' &&
    (!navigator.canShare || navigator.canShare({ files: [file] }))
  ) {
    try {
      await navigator.share({ files: [file], title, text: title })
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err
    }
  }

  await downloadCardPng(node, filenameBase)
  return 'downloaded'
}
