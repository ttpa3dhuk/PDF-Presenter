export type Layout = 'solo' | 'presenter-audience' | 'operator-speaker-audience'
export type Role = 'operator' | 'speaker' | 'audience'
export type DisplayMap = Partial<Record<Role, number>>

export interface TimerState {
  durationMs: number
  startedAt: number | null
  elapsedMs: number
  running: boolean
}

export type TimerFont = 'system' | 'mono' | 'rounded' | 'display'

export type FileKind = 'pdf' | 'image' | 'pptx'

export interface PlaylistEntry {
  id: string
  kind: FileKind
  filePath: string
  fileName: string
  speakerName: string
  durationMs: number
}

export interface AppState {
  pdfPath: string | null
  pdfSha1: string | null
  fileKind: FileKind | null
  totalSlides: number
  currentSlide: number
  blackout: boolean
  timer: TimerState
  timerFont: TimerFont
  notes: Record<number, string>
  layout: Layout
  displayMap: DisplayMap
  playlist: PlaylistEntry[]
  currentPlaylistId: string | null
  keyVisualPath: string | null
  projectPath: string | null
}

export interface DisplayInfo {
  id: number
  label: string
  internal: boolean
  bounds: { x: number; y: number; width: number; height: number }
}

export interface OpenPdfResult {
  ok: boolean
  path?: string
  totalSlides?: number
  sha1?: string
  sha1Mismatch?: boolean
  cancelled?: boolean
  error?: string
  kind?: FileKind
}

export type Unsubscribe = () => void

export interface PresenterApi {
  state: {
    get(): Promise<AppState>
    onPatch(cb: (patch: Partial<AppState>) => void): Unsubscribe
    onFull(cb: (full: AppState) => void): Unsubscribe
  }
  pdf: {
    openDialog(): Promise<OpenPdfResult>
    openPath(path: string): Promise<OpenPdfResult>
    read(): Promise<{ bytes: Uint8Array; mime: string } | null>
    reportTotal(total: number): Promise<void>
  }
  nav: {
    goto(slide: number): Promise<void>
    next(): Promise<void>
    prev(): Promise<void>
  }
  note: {
    update(slide: number, text: string): Promise<void>
  }
  timer: {
    start(): Promise<void>
    pause(): Promise<void>
    reset(): Promise<void>
    setDuration(ms: number): Promise<void>
    adjust(deltaMs: number): Promise<void>
    setFont(font: TimerFont): Promise<void>
  }
  blackout: {
    toggle(): Promise<void>
  }
  displays: {
    list(): Promise<DisplayInfo[]>
  }
  layout: {
    set(layout: Layout, displayMap: DisplayMap): Promise<void>
  }
  playlist: {
    add(): Promise<PlaylistEntry[]>
    remove(id: string): Promise<void>
    reorder(ids: string[]): Promise<void>
    update(id: string, payload: { speakerName?: string; durationMs?: number }): Promise<void>
    activate(id: string): Promise<OpenPdfResult>
  }
  keyvisual: {
    set(): Promise<{ path: string | null }>
    clear(): Promise<void>
    read(): Promise<{ bytes: Uint8Array; mime: string } | null>
  }
  project: {
    create(): Promise<void>
    save(saveAs?: boolean): Promise<{ ok: boolean; path?: string; error?: string }>
    open(): Promise<{ ok: boolean; path?: string; error?: string }>
  }
  menu: {
    onOpenPdf(cb: () => void): Unsubscribe
    onOpenDisplaySetup(cb: () => void): Unsubscribe
    onTopologyChanged(cb: () => void): Unsubscribe
    onProjectNew(cb: () => void): Unsubscribe
    onProjectOpen(cb: () => void): Unsubscribe
    onProjectSave(cb: () => void): Unsubscribe
    onProjectSaveAs(cb: () => void): Unsubscribe
  }
  update: {
    onAvailable(cb: (info: { newerVersion: string; url: string }) => void): Unsubscribe
  }
  external: {
    open(url: string): Promise<void>
  }
}

declare global {
  interface Window {
    api: PresenterApi
  }
}
