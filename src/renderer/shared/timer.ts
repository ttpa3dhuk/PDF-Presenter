import type { TimerState } from '../../preload/api'

export type TimerColor = 'green' | 'yellow' | 'red'

export interface TimerView {
  remainingMs: number
  text: string
  color: TimerColor
  overtime: boolean
}

export function elapsedMs(timer: TimerState, now: number = Date.now()): number {
  if (timer.running && timer.startedAt !== null) {
    return timer.elapsedMs + (now - timer.startedAt)
  }
  return timer.elapsedMs
}

export function remainingMs(timer: TimerState, now: number = Date.now()): number {
  return timer.durationMs - elapsedMs(timer, now)
}

export function timerColor(remaining: number, duration: number): TimerColor {
  if (remaining <= 0) return 'red'
  if (duration <= 0) return 'green'
  const pct = remaining / duration
  if (pct < 0.1) return 'red'
  if (pct < 0.33) return 'yellow'
  return 'green'
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatMs(ms: number, signed: boolean = false): string {
  const negative = ms < 0
  const totalSec = Math.floor(Math.abs(ms) / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const body = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  if (signed && negative) return `−${body}`
  return body
}

export function timerView(timer: TimerState, now: number = Date.now()): TimerView {
  const remaining = remainingMs(timer, now)
  return {
    remainingMs: remaining,
    text: formatMs(remaining, true),
    color: timerColor(remaining, timer.durationMs),
    overtime: remaining < 0,
  }
}

export function startTimerTick(
  getTimer: () => TimerState,
  onTick: (view: TimerView) => void,
): () => void {
  const update = () => onTick(timerView(getTimer()))
  update()
  const id = window.setInterval(update, 250)
  return () => window.clearInterval(id)
}
