import { BrowserWindow, ipcMain } from 'electron'
import { IPC } from '../../shared/constants'
import { checkLicense, activateLicense } from '../services/license.service'
import type { FishService } from '../services/fish.service'
import type { SlackService } from '../services/slack.service'
import type { GmailService } from '../services/gmail.service'
import { getDB } from '../services/db'
import type { AppSettings, AcknowledgePayload, OAuthStartPayload } from '../../shared/types'

export function registerIPC(
  win: BrowserWindow,
  fishService: FishService,
  slackService: SlackService,
  gmailService: GmailService
) {
  // License
  ipcMain.on(IPC.LICENSE_CHECK, async () => {
    const result = await checkLicense()
    fishService.setLicensed(result.valid)
    win.webContents.send(IPC.LICENSE_RESULT, result)
  })

  ipcMain.handle('license:activate', async (_e, key: string) => {
    const result = await activateLicense(key)
    if (result.valid) fishService.setLicensed(true)
    return result
  })

  // Notifications
  ipcMain.on(IPC.NOTIFICATION_ACKNOWLEDGE, (_e, payload: AcknowledgePayload) => {
    fishService.acknowledge(payload.id)
    fishService.pushUpdate(win)
  })

  // OAuth
  ipcMain.on(IPC.OAUTH_START, (_e, payload: OAuthStartPayload) => {
    if (payload.provider === 'slack') slackService.startOAuth(win)
    else if (payload.provider === 'gmail') gmailService.startOAuth(win)
  })

  // Settings
  ipcMain.handle(IPC.SETTINGS_GET, (): AppSettings => {
    const db = getDB()
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
    const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
    return {
      slackPollIntervalMs: parseInt(map.slackPollIntervalMs ?? '60000'),
      gmailPollIntervalMs: parseInt(map.gmailPollIntervalMs ?? '90000'),
      muted: map.muted === 'true',
      alwaysOnTop: map.alwaysOnTop !== 'false',
      startWithWindows: map.startWithWindows === 'true',
      fishRenderer: (map.fishRenderer as AppSettings['fishRenderer']) ?? 'procedural',
    }
  })

  ipcMain.handle(IPC.SETTINGS_SET, (_e, settings: Partial<AppSettings>) => {
    const db = getDB()
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    for (const [key, value] of Object.entries(settings)) {
      upsert.run(key, String(value))
    }
  })

  ipcMain.on(IPC.WINDOW_SET_ALWAYS_ON_TOP, (_e, value: boolean) => {
    win.setAlwaysOnTop(value)
  })
}
