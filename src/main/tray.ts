import { Tray, Menu, BrowserWindow, app, nativeImage } from 'electron'
import path from 'path'
import { IPC } from '../shared/constants'

let tray: Tray | null = null

export function setupTray(win: BrowserWindow) {
  // Use a simple fallback icon if the asset doesn't exist yet
  let icon: Electron.NativeImage
  try {
    icon = nativeImage.createFromPath(path.join(__dirname, '../../assets/ui/icon.ico'))
  } catch {
    icon = nativeImage.createEmpty()
  }

  tray = new Tray(icon)
  tray.setToolTip('ShellStack Aquarium')

  const buildMenu = () =>
    Menu.buildFromTemplate([
      {
        label: 'Show Aquarium',
        click: () => {
          win.show()
          win.focus()
        },
      },
      {
        label: 'Settings',
        click: () => {
          win.show()
          win.focus()
          win.webContents.send('ui:openSettings')
        },
      },
      { type: 'separator' },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: win.isAlwaysOnTop(),
        click: (item) => {
          win.setAlwaysOnTop(item.checked)
          win.webContents.send(IPC.WINDOW_SET_ALWAYS_ON_TOP, item.checked)
          tray?.setContextMenu(buildMenu())
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ])

  tray.setContextMenu(buildMenu())

  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
  })
}
