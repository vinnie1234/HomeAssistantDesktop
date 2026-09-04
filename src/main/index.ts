import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { store } from './store'

let tray: Tray | null = null
let popupWindow: BrowserWindow | null = null

function createPopupWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 440,
    height: 620,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#fafafa',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  win.on('blur', () => {
    if (!win.webContents.isDevToolsOpened()) {
      win.hide()
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function getWindowPosition(tray: Tray, window: BrowserWindow): { x: number; y: number } {
  const trayBounds = tray.getBounds()
  const windowBounds = window.getBounds()
  const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y })

  let x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
  let y = Math.round(trayBounds.y + trayBounds.height + 4)

  // Adjust if window would go off screen
  if (x + windowBounds.width > display.bounds.x + display.bounds.width) {
    x = display.bounds.x + display.bounds.width - windowBounds.width - 8
  }
  if (x < display.bounds.x) {
    x = display.bounds.x + 8
  }
  // On macOS tray is at top, on Windows at bottom
  if (y + windowBounds.height > display.bounds.y + display.bounds.height) {
    y = trayBounds.y - windowBounds.height - 4
  }

  return { x, y }
}

function togglePopup(): void {
  if (!popupWindow) return

  if (popupWindow.isVisible()) {
    popupWindow.hide()
  } else {
    const pos = getWindowPosition(tray!, popupWindow)
    popupWindow.setPosition(pos.x, pos.y, false)
    popupWindow.show()
    popupWindow.focus()
  }
}

function createTray(): void {
  const iconPath = join(__dirname, '../../resources/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(icon)

  tray.setToolTip('Home Assistant')
  tray.on('click', togglePopup)
  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open', click: togglePopup },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ])
    tray!.popUpContextMenu(contextMenu)
  })
}

// IPC handlers
ipcMain.handle('store:get', (_, key: string) => store.get(key))
ipcMain.handle('store:set', (_, key: string, value: unknown) => store.set(key, value))
ipcMain.handle('store:delete', (_, key: string) => store.delete(key))
ipcMain.handle('window:hide', () => popupWindow?.hide())

app.whenReady().then(() => {
  app.setAppUserModelId('Home Assistant')

  // Hide from dock/taskbar — tray only
  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  popupWindow = createPopupWindow()
  createTray()

  app.on('activate', () => {
    if (!popupWindow?.isVisible()) togglePopup()
  })
})

app.on('window-all-closed', (e) => {
  e.preventDefault() // Keep running in tray
})
