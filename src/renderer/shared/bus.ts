import type { AppState } from '../../preload/api'

type Listener = (state: AppState, patch: Partial<AppState> | null) => void

let state: AppState | null = null
const listeners = new Set<Listener>()

export async function initBus(): Promise<AppState> {
  state = await window.api.state.get()
  window.api.state.onFull((full) => {
    state = full
    notify(null)
  })
  window.api.state.onPatch((patch) => {
    if (!state) return
    state = { ...state, ...patch } as AppState
    notify(patch)
  })
  return state
}

export function getState(): AppState {
  if (!state) throw new Error('Bus not initialised — call initBus() first')
  return state
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify(patch: Partial<AppState> | null): void {
  if (!state) return
  for (const fn of listeners) fn(state, patch)
}
