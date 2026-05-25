import { BrowserWindow, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import type { DisplayMap, Layout, Role } from './layout.js'
import { rolesForLayout } from './layout.js'
import { store } from './state.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PRELOAD = resolve(__dirname, '../preload/index.cjs')

const DEV_TILE = process.env.PRESENTER_DEV_TILE === '1'

interface RendererTarget {
  entry: 'presenter' | 'audience'
  role: Role
}

function rendererForRole(role: Role): RendererTarget {
  return role === 'audience' ? { entry: 'audience', role } : { entry: 'presenter', role }
}

function loadRenderer(win: BrowserWindow, target: RendererTarget): void {
  const devServerUrl = process.env['ELECTRON_RENDERER_URL']
  const query = `role=${target.role}`
  if (devServerUrl) {
    win.loadURL(`${devServerUrl}/${target.entry}/index.html?${query}`)
  } else {
    win.loadFile(join(__dirname, `../renderer/${target.entry}/index.html`), {
      search: query,
    })
  }
}

function displayBounds(displayId: number | undefined): Electron.Rectangle {
  const displays = screen.getAllDisplays()
  const d = displays.find((x) => x.id === displayId) ?? screen.getPrimaryDisplay()
  return d.bounds
}

function tilePosition(role: Role): Electron.Rectangle {
  const primary = screen.getPrimaryDisplay().workArea
  const w = Math.floor(primary.width / 2)
  const h = Math.floor(primary.height / 2)
  const positions: Record<Role, Electron.Rectangle> = {
    operator: { x: primary.x, y: primary.y, width: w, height: h },
    speaker: { x: primary.x + w, y: primary.y, width: w, height: h },
    audience: { x: primary.x, y: primary.y + h, width: primary.width, height: h },
  }
  return positions[role]
}

function createWindow(role: Role, displayId: number | undefined, fullscreen: boolean): BrowserWindow {
  const bounds = DEV_TILE ? tilePosition(role) : displayBounds(displayId)

  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    show: false,
    fullscreen: fullscreen && !DEV_TILE,
    backgroundColor: role === 'audience' ? '#000000' : '#1a1a1a',
    title: `PDF Presenter — ${role}`,
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  loadRenderer(win, rendererForRole(role))

  win.once('ready-to-show', () => {
    if (!DEV_TILE && fullscreen) {
      win.setBounds(bounds)
      win.setFullScreen(true)
    }
    win.show()
    if (role === 'operator') win.focus()
  })

  store.registerWindow(role, win)
  return win
}

let activeWindows = new Map<Role, BrowserWindow>()

export function applyLayout(layout: Layout, displayMap: DisplayMap): Map<Role, BrowserWindow> {
  const desiredRoles = new Set<Role>(rolesForLayout(layout))

  // Close windows whose role is no longer active
  for (const [role, win] of activeWindows) {
    if (!desiredRoles.has(role)) {
      store.unregisterWindow(role)
      if (!win.isDestroyed()) win.close()
      activeWindows.delete(role)
    }
  }

  // Open missing windows and reposition existing ones
  for (const role of desiredRoles) {
    const fullscreen = role === 'audience' || role === 'speaker'
    const existing = activeWindows.get(role)
    if (existing && !existing.isDestroyed()) {
      if (!DEV_TILE) {
        const bounds = displayBounds(displayMap[role])
        existing.setFullScreen(false)
        existing.setBounds(bounds)
        if (fullscreen) existing.setFullScreen(true)
      }
    } else {
      const win = createWindow(role, displayMap[role], fullscreen)
      activeWindows.set(role, win)
    }
  }

  store.patch({ layout, displayMap })
  return activeWindows
}

export function getActiveWindows(): Map<Role, BrowserWindow> {
  return activeWindows
}

export function getOperatorWindow(): BrowserWindow | undefined {
  return activeWindows.get('operator')
}
