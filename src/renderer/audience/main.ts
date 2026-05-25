import { initBus, getState, subscribe } from '../shared/bus'
import { loadDocument, renderPageTo, prerender } from '../shared/pdf-loader'
import type { AppState } from '../../preload/api'

const canvas = document.getElementById('slide-canvas') as HTMLCanvasElement
const slideImage = document.getElementById('slide-image') as HTMLImageElement
const blackout = document.getElementById('blackout') as HTMLDivElement
const kvImage = document.getElementById('keyvisual') as HTMLImageElement

let docLoaded = false
let lastRenderedSlide = -1
let lastFilePath: string | null = null
let slideImageBlobUrl: string | null = null
let kvBlobUrl: string | null = null
let kvLoadedForPath: string | null | undefined = undefined

function disposeSlideImage(): void {
  if (slideImageBlobUrl) {
    URL.revokeObjectURL(slideImageBlobUrl)
    slideImageBlobUrl = null
  }
}

async function loadFile(): Promise<void> {
  disposeSlideImage()
  docLoaded = false
  lastRenderedSlide = -1

  const data = await window.api.pdf.read()
  if (!data) return
  const state = getState()

  if (state.fileKind === 'image') {
    const blob = new Blob([data.bytes as BlobPart], { type: data.mime })
    slideImageBlobUrl = URL.createObjectURL(blob)
    slideImage.src = slideImageBlobUrl
    slideImage.classList.remove('hidden')
    canvas.classList.add('hidden')
    return
  }

  // PDF
  slideImage.classList.add('hidden')
  slideImage.removeAttribute('src')
  canvas.classList.remove('hidden')
  await loadDocument(data.bytes)
  docLoaded = true
  await renderSlide()
}

async function renderSlide(): Promise<void> {
  const state = getState()
  if (state.fileKind === 'image' || state.fileKind === null) return
  if (!docLoaded) return
  if (state.currentSlide === lastRenderedSlide) return
  lastRenderedSlide = state.currentSlide
  const width = window.innerWidth
  await renderPageTo(state.currentSlide, canvas, width)
  if (state.currentSlide + 1 <= state.totalSlides) {
    prerender(state.currentSlide + 1, width).catch(() => undefined)
  }
}

async function refreshKeyVisual(state: AppState): Promise<void> {
  const path = state.keyVisualPath
  if (path === kvLoadedForPath) return
  kvLoadedForPath = path

  if (kvBlobUrl) {
    URL.revokeObjectURL(kvBlobUrl)
    kvBlobUrl = null
  }
  if (!path) {
    kvImage.removeAttribute('src')
    return
  }
  const data = await window.api.keyvisual.read()
  if (!data) {
    kvImage.removeAttribute('src')
    return
  }
  const blob = new Blob([data.bytes as BlobPart], { type: data.mime })
  kvBlobUrl = URL.createObjectURL(blob)
  kvImage.src = kvBlobUrl
}

function applyOverlay(state: AppState): void {
  const showImage = state.blackout && Boolean(state.keyVisualPath) && Boolean(kvBlobUrl)
  const showBlack = state.blackout && !showImage
  kvImage.classList.toggle('hidden', !showImage)
  blackout.classList.toggle('hidden', !showBlack)
}

async function applyState(state: AppState): Promise<void> {
  await refreshKeyVisual(state)
  applyOverlay(state)

  if (state.pdfPath && state.pdfPath !== lastFilePath) {
    lastFilePath = state.pdfPath
    await loadFile()
  } else if (
    state.fileKind !== 'image' &&
    state.fileKind !== null &&
    state.currentSlide !== lastRenderedSlide
  ) {
    await renderSlide()
  }
}

async function bootstrap(): Promise<void> {
  await initBus()
  subscribe((state) => {
    applyState(state).catch(() => undefined)
  })

  const initial = getState()
  await refreshKeyVisual(initial)
  applyOverlay(initial)
  if (initial.pdfPath) {
    lastFilePath = initial.pdfPath
    await loadFile()
  }

  window.addEventListener('resize', () => {
    const kind = getState().fileKind
    if (kind === 'image' || kind === null) return
    lastRenderedSlide = -1
    renderSlide().catch(() => undefined)
  })
}

bootstrap().catch(() => undefined)
