import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

const PAGE_CACHE_MAX = 8

class OffscreenCache {
  private entries = new Map<string, HTMLCanvasElement>()

  private key(page: number, width: number): string {
    return `${page}@${width}`
  }

  get(page: number, width: number): HTMLCanvasElement | undefined {
    const k = this.key(page, width)
    const hit = this.entries.get(k)
    if (hit) {
      this.entries.delete(k)
      this.entries.set(k, hit)
    }
    return hit
  }

  set(page: number, width: number, value: HTMLCanvasElement): void {
    const k = this.key(page, width)
    if (this.entries.has(k)) this.entries.delete(k)
    this.entries.set(k, value)
    while (this.entries.size > PAGE_CACHE_MAX) {
      const firstKey = this.entries.keys().next().value
      if (firstKey !== undefined) this.entries.delete(firstKey)
    }
  }

  clear(): void {
    this.entries.clear()
  }
}

const cache = new OffscreenCache()
const inflight = new Map<string, Promise<HTMLCanvasElement | null>>()
const latestRequest = new WeakMap<HTMLCanvasElement, number>()

let doc: PDFDocumentProxy | null = null
let docToken = 0

export async function loadDocument(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const copy = new Uint8Array(bytes)
  const loadingTask = pdfjs.getDocument({ data: copy })
  const newDoc = await loadingTask.promise
  if (doc) {
    try {
      await doc.destroy()
    } catch {
      /* ignore */
    }
  }
  doc = newDoc
  docToken++
  cache.clear()
  inflight.clear()
  return newDoc
}

export function getDocument(): PDFDocumentProxy | null {
  return doc
}

export function totalPages(): number {
  return doc?.numPages ?? 0
}

function devicePixelScale(): number {
  return Math.min(window.devicePixelRatio || 1, 2)
}

async function renderToOffscreen(pageNum: number, targetWidth: number): Promise<HTMLCanvasElement | null> {
  if (!doc) return null
  if (pageNum < 1 || pageNum > doc.numPages) return null
  if (targetWidth <= 0) return null

  const cached = cache.get(pageNum, targetWidth)
  if (cached) return cached

  const key = `${pageNum}@${targetWidth}`
  const inProgress = inflight.get(key)
  if (inProgress) return inProgress

  const tokenAtStart = docToken
  const promise = (async () => {
    try {
      const page = await doc!.getPage(pageNum)
      if (tokenAtStart !== docToken) return null

      const baseViewport = page.getViewport({ scale: 1 })
      const dpr = devicePixelScale()
      const scale = (targetWidth / baseViewport.width) * dpr
      const viewport = page.getViewport({ scale })

      const off = document.createElement('canvas')
      off.width = Math.floor(viewport.width)
      off.height = Math.floor(viewport.height)
      const ctx = off.getContext('2d')
      if (!ctx) return null

      let task: RenderTask | null = null
      try {
        task = page.render({ canvasContext: ctx, viewport })
        await task.promise
      } catch (err) {
        const name = (err as { name?: string })?.name
        if (name === 'RenderingCancelledException') return null
        throw err
      }
      if (tokenAtStart !== docToken) return null
      cache.set(pageNum, targetWidth, off)
      return off
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, promise)
  return promise
}

export async function renderPageTo(
  pageNum: number,
  visibleCanvas: HTMLCanvasElement,
  targetWidth: number,
): Promise<void> {
  latestRequest.set(visibleCanvas, pageNum)
  const off = await renderToOffscreen(pageNum, targetWidth)
  if (!off) return
  if (latestRequest.get(visibleCanvas) !== pageNum) return

  const dpr = devicePixelScale()
  if (visibleCanvas.width !== off.width || visibleCanvas.height !== off.height) {
    visibleCanvas.width = off.width
    visibleCanvas.height = off.height
  }
  visibleCanvas.style.width = `${Math.floor(off.width / dpr)}px`
  visibleCanvas.style.height = `${Math.floor(off.height / dpr)}px`

  const ctx = visibleCanvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(off, 0, 0)
}

export async function prerender(pageNum: number, targetWidth: number): Promise<void> {
  await renderToOffscreen(pageNum, targetWidth).catch(() => null)
}
