import Store from 'electron-store'
import { screen } from 'electron'
import type { DisplayMap, Layout } from './layout.js'
import type { PlaylistEntry, TimerFont } from './state.js'

interface SavedMapping {
  layout: Layout
  displayMap: DisplayMap
}

interface PersistedShape {
  mappings: Record<string, SavedMapping>
  lastPdfPath: string | null
  lastDurationMs: number
  timerFont: TimerFont
  playlist: PlaylistEntry[]
  currentPlaylistId: string | null
  keyVisualPath: string | null
  projectPath: string | null
}

const store = new Store<PersistedShape>({
  name: 'pdf-presenter',
  defaults: {
    mappings: {},
    lastPdfPath: null,
    lastDurationMs: 30 * 60 * 1000,
    timerFont: 'system',
    playlist: [],
    currentPlaylistId: null,
    keyVisualPath: null,
    projectPath: null,
  },
})

function topologyKey(displayIds: number[]): string {
  return [...displayIds].sort((a, b) => a - b).join(',')
}

export function currentTopologyKey(): string {
  return topologyKey(screen.getAllDisplays().map((d) => d.id))
}

export function getSavedMapping(): SavedMapping | null {
  const key = currentTopologyKey()
  const mappings = store.get('mappings')
  return mappings[key] ?? null
}

export function saveMapping(layout: Layout, displayMap: DisplayMap): void {
  const key = currentTopologyKey()
  const mappings = store.get('mappings')
  mappings[key] = { layout, displayMap }
  store.set('mappings', mappings)
}

export function getLastPdfPath(): string | null {
  return store.get('lastPdfPath')
}

export function setLastPdfPath(path: string | null): void {
  store.set('lastPdfPath', path)
}

export function getLastDurationMs(): number {
  return store.get('lastDurationMs')
}

export function setLastDurationMs(ms: number): void {
  store.set('lastDurationMs', ms)
}

export function getTimerFont(): TimerFont {
  return store.get('timerFont')
}

export function setTimerFont(font: TimerFont): void {
  store.set('timerFont', font)
}

export function getPlaylist(): PlaylistEntry[] {
  const raw = store.get('playlist') as unknown[]
  return raw.map((e) => {
    const v = e as Record<string, unknown>
    return {
      id: String(v.id),
      kind: (v.kind as PlaylistEntry['kind']) ?? 'pdf',
      filePath: String(v.filePath ?? v.pdfPath ?? ''),
      fileName: String(v.fileName ?? v.pdfName ?? ''),
      speakerName: String(v.speakerName ?? ''),
      durationMs: Number(v.durationMs ?? 30 * 60 * 1000),
    }
  })
}

export function setPlaylist(playlist: PlaylistEntry[]): void {
  store.set('playlist', playlist)
}

export function getCurrentPlaylistId(): string | null {
  return store.get('currentPlaylistId')
}

export function setCurrentPlaylistId(id: string | null): void {
  store.set('currentPlaylistId', id)
}

export function getKeyVisualPath(): string | null {
  return store.get('keyVisualPath')
}

export function setKeyVisualPath(path: string | null): void {
  store.set('keyVisualPath', path)
}

export function getProjectPath(): string | null {
  return store.get('projectPath')
}

export function setProjectPath(path: string | null): void {
  store.set('projectPath', path)
}
