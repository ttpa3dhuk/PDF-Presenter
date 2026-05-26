import { app, BrowserWindow, globalShortcut, ipcMain, Menu, screen, shell } from 'electron'
import { checkForUpdates } from './updater.js'
import { autoAssignDisplays, defaultLayoutForDisplayCount } from './layout.js'
import { applyLayout, getOperatorWindow } from './windows.js'
import { registerIpcHandlers, flushPendingWrites, kindOf } from './ipc.js'
import {
  getSavedMapping,
  saveMapping,
  getLastPdfPath,
  getLastDurationMs,
  getTimerMode,
  getTimerPosition,
  getTimerScale,
  getNotesFontSize,
  getPlaylist,
  getCurrentPlaylistId,
  getKeyVisualPath,
  getProjectPath,
  getPlaylistCompact,
  getAutoAdvance,
} from './display-mapping.js'
import { store } from './state.js'
import { computePdfSha1, loadNotes, sha1FromBuffer } from './notes-store.js'
import { readFile } from 'node:fs/promises'

function buildMenu(): void {
  const isMac = process.platform === 'darwin'
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                label: 'Display Setup…',
                accelerator: 'CmdOrCtrl+,',
                click: () => sendToOperator('menu:open-display-setup'),
              },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ] as Electron.MenuItemConstructorOptions[])
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Новый проект',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendToOperator('menu:project-new'),
        },
        {
          label: 'Открыть проект…',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => sendToOperator('menu:project-open'),
        },
        {
          label: 'Сохранить проект',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendToOperator('menu:project-save'),
        },
        {
          label: 'Сохранить как…',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendToOperator('menu:project-save-as'),
        },
        { type: 'separator' },
        {
          label: 'Открыть PDF / PPTX…',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendToOperator('menu:open-pdf'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Горячие клавиши…',
          accelerator: 'Shift+/',
          click: () => sendToOperator('menu:help'),
        },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function sendToOperator(channel: string, ...args: unknown[]): void {
  const op = getOperatorWindow()
  if (op && !op.isDestroyed()) op.webContents.send(channel, ...args)
}

async function restoreLastPdf(): Promise<void> {
  const lastPath = getLastPdfPath()
  if (!lastPath) return
  const kind = kindOf(lastPath)
  if (!kind) return
  try {
    let sha1: string
    let totalSlides = 1

    if (kind === 'pdf') {
      // Single read: compute SHA1 and count pages from the same buffer.
      const buf = await readFile(lastPath)
      sha1 = sha1FromBuffer(buf)
      const text = buf.toString('latin1')
      totalSlides = (text.match(/\/Type\s*\/Page(?!s)/g) ?? []).length
    } else {
      // Images and PPTX: only need SHA1; page count is 1 or comes from renderer.
      sha1 = await computePdfSha1(lastPath)
    }

    const loaded = await loadNotes(lastPath, sha1)
    store.patch({
      pdfPath: lastPath,
      pdfSha1: sha1,
      fileKind: kind,
      totalSlides,
      notes: loaded.notes,
      currentSlide: 1,
      blackout: false,
    })
  } catch {
    // file gone or unreadable — ignore
  }
}

function bootLayout(): void {
  const displays = screen.getAllDisplays()
  const primaryId = screen.getPrimaryDisplay().id
  const displayInfo = displays.map((d) => ({ id: d.id, internal: d.id === primaryId }))

  const saved = getSavedMapping()
  if (saved) {
    applyLayout(saved.layout, saved.displayMap)
    return
  }

  const layout = defaultLayoutForDisplayCount(displays.length)
  const displayMap = autoAssignDisplays(layout, displayInfo)
  applyLayout(layout, displayMap)
  saveMapping(layout, displayMap)
}

function registerShortcuts(): void {
  // Most shortcuts handled by renderer via keydown; we only register a few global ones.
  globalShortcut.register('CommandOrControl+,', () => sendToOperator('menu:open-display-setup'))
}

function watchDisplayChanges(): void {
  const onChange = () => sendToOperator('display:topology-changed')
  screen.on('display-added', onChange)
  screen.on('display-removed', onChange)
  screen.on('display-metrics-changed', onChange)
}

app.whenReady().then(async () => {
  registerIpcHandlers()
  buildMenu()

  ipcMain.handle('external:open', (_e, url: string) => {
    if (typeof url === 'string' && /^https?:\/\//.test(url)) {
      shell.openExternal(url).catch(() => undefined)
    }
  })

  // Restore saved timer settings + playlist before any window opens
  store.patch({
    timer: { ...store.get().timer, durationMs: getLastDurationMs() },
    timerMode: getTimerMode(),
    timerPosition: getTimerPosition(),
    timerScale: getTimerScale(),
    notesFontSize: getNotesFontSize(),
    playlist: getPlaylist(),
    currentPlaylistId: getCurrentPlaylistId(),
    playlistCompact: getPlaylistCompact(),
    autoAdvance: getAutoAdvance(),
    keyVisualPath: getKeyVisualPath(),
    projectPath: getProjectPath(),
  })

  bootLayout()
  await restoreLastPdf()
  registerShortcuts()
  watchDisplayChanges()

  // Check for updates a few seconds after boot, then daily
  const scheduleUpdateCheck = () => {
    checkForUpdates().then((info) => {
      if (info) sendToOperator('update:available', info)
    })
  }
  setTimeout(scheduleUpdateCheck, 5000)
  setInterval(scheduleUpdateCheck, 24 * 60 * 60 * 1000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) bootLayout()
  })
})

app.on('window-all-closed', async () => {
  await flushPendingWrites()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', async (e) => {
  e.preventDefault()
  await flushPendingWrites()
  app.exit(0)
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
