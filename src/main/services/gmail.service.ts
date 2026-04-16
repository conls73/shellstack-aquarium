import { BrowserWindow } from 'electron'
import { getDB } from './db'
import { POLL_GMAIL_MS } from '../../shared/constants'
import type { FishService } from './fish.service'
import { startOAuthServer } from '../oauth-server'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_LABEL_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ''

export class GmailService {
  private pollTimer: ReturnType<typeof setInterval> | null = null

  constructor(private fishService: FishService) {}

  getToken(): string | null {
    const db = getDB()
    const row = db.prepare("SELECT access_token, expires_at FROM oauth_tokens WHERE provider = 'gmail'").get() as
      | { access_token: string; expires_at: number }
      | undefined
    return row?.access_token ?? null
  }

  async startOAuth(win: BrowserWindow) {
    const { port, code } = await startOAuthServer('/gmail/callback')
    const redirectUri = `http://localhost:${port}/gmail/callback`
    const url =
      `${GOOGLE_AUTH_URL}?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly')}` +
      `&access_type=offline&prompt=consent`

    const { shell } = await import('electron')
    shell.openExternal(url)

    try {
      const authCode = await code
      await this.exchangeCode(authCode, redirectUri)
      win.webContents.send('oauth:complete', { provider: 'gmail', success: true })
      this.startPolling(win)
    } catch (err) {
      win.webContents.send('oauth:complete', { provider: 'gmail', success: false, error: String(err) })
    }
  }

  private async exchangeCode(code: string, redirectUri: string) {
    const resp = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const data = (await resp.json()) as {
      access_token?: string; refresh_token?: string; expires_in?: number; error?: string
    }
    if (!data.access_token) throw new Error(data.error ?? 'Gmail OAuth failed')
    const db = getDB()
    db.prepare(`
      INSERT OR REPLACE INTO oauth_tokens (provider, access_token, refresh_token, expires_at)
      VALUES ('gmail', ?, ?, ?)
    `).run(data.access_token, data.refresh_token ?? null, Date.now() + (data.expires_in ?? 3600) * 1000)
  }

  async poll(win: BrowserWindow) {
    const token = this.getToken()
    if (!token) return

    try {
      const resp = await fetch(GMAIL_LABEL_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = (await resp.json()) as { messagesUnread?: number }
      const count = data.messagesUnread ?? 0
      if (count > 0) {
        this.fishService.upsertNotification('gmail_inbox', 'gmail', 'goldfish', count, 'Gmail Inbox')
      }
      this.fishService.pushUpdate(win)
    } catch {
      // silently skip
    }
  }

  startPolling(win: BrowserWindow) {
    if (this.pollTimer) clearInterval(this.pollTimer)
    this.poll(win)
    this.pollTimer = setInterval(() => this.poll(win), POLL_GMAIL_MS)
  }
}
