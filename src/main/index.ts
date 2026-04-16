import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { initDB } from './services/db'
import { setupTray } from './tray'
import { registerIPC } from './ipc/index'
import { FishService } from './services/fish.service'
import { SlackService } from './services/slack.service'
import { GmailService } from './services/gmail.service'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    hasShadow: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Allow click-through on the transparent areas so users can still use their desktop.
  // We re-enable mouse events only over interactive UI elements via setIgnoreMouseEvents in renderer.
  mainWindow.setIgnoreMouseEvents(false)

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Prevent navigation to external URLs
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  return mainWindow
}

app.whenReady().then(() => {
  initDB()

  const win = createWindow()
  const fishService = new FishService()
  const slackService = new SlackService(fishService)
  const gmailService = new GmailService(fishService)

  setupTray(win)
  registerIPC(win, fishService, slackService, gmailService)

  fishService.startPolling(win)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
