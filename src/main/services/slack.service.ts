import { BrowserWindow } from 'electron'
import { getDB } from './db'
import { POLL_SLACK_MS } from '../../shared/constants'
import type { FishService } from './fish.service'
import { startOAuthServer } from '../oauth-server'

const SLACK_AUTHORIZE_URL = 'https://slack.com/oauth/v2/authorize'
const SLACK_TOKEN_URL = 'https://slack.com/api/oauth.v2.access'
const SLACK_SCOPES = 'channels:read,groups:read,im:read,mpim:read'

// Set via environment or .env — users register their own Slack app
const CLIENT_ID = process.env.SLACK_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET ?? ''

export class SlackService {
  private pollTimer: ReturnType<typeof setInterval> | null = null

  constructor(private fishService: FishService) {}

  getToken(): string | null {
    const db = getDB()
    const row = db.prepare("SELECT access_token FROM oauth_tokens WHERE provider = 'slack'").get() as
      | { access_token: string }
      | undefined
    return row?.access_token ?? null
  }

  async startOAuth(win: BrowserWindow) {
    const { port, code } = await startOAuthServer('/slack/callback')
    const redirectUri = `http://localhost:${port}/slack/callback`
    const url =
      `${SLACK_AUTHORIZE_URL}?client_id=${CLIENT_ID}` +
      `&scope=${encodeURIComponent(SLACK_SCOPES)}` +
      `&user_scope=identity.basic` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`

    win.webContents.send('oauth:opening', { provider: 'slack', url })
    const { shell } = await import('electron')
    shell.openExternal(url)

    try {
      const authCode = await code
      await this.exchangeCode(authCode, redirectUri)
      win.webContents.send('oauth:complete', { provider: 'slack', success: true })
      this.startPolling(win)
    } catch (err) {
      win.webContents.send('oauth:complete', { provider: 'slack', success: false, error: String(err) })
    }
  }

  private async exchangeCode(code: string, redirectUri: string) {
    const resp = await fetch(SLACK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    })
    const data = (await resp.json()) as {
      ok: boolean; authed_user?: { access_token: string }; error?: string
    }
    if (!data.ok || !data.authed_user?.access_token) {
      throw new Error(data.error ?? 'Slack OAuth failed')
    }
    const db = getDB()
    db.prepare(`
      INSERT OR REPLACE INTO oauth_tokens (provider, access_token, refresh_token, expires_at)
      VALUES ('slack', ?, NULL, 0)
    `).run(data.authed_user.access_token)
  }

  async poll(win: BrowserWindow) {
    const token = this.getToken()
    if (!token) return

    try {
      const resp = await fetch('https://slack.com/api/conversations.list?types=im&limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = (await resp.json()) as {
        ok: boolean
        channels?: { id: string; user: string; is_im: boolean; unread_count_display?: number; name?: string }[]
      }
      if (!data.ok || !data.channels) return

      for (const ch of data.channels) {
        if (!ch.is_im) continue
        const count = ch.unread_count_display ?? 0
        if (count > 0) {
          this.fishService.upsertNotification(`slack_dm_${ch.id}`, 'slack_dm', 'angelfish', count, ch.user)
        }
      }
      this.fishService.pushUpdate(win)
    } catch {
      // Network error — silently skip this poll cycle
    }
  }

  startPolling(win: BrowserWindow) {
    if (this.pollTimer) clearInterval(this.pollTimer)
    this.poll(win)
    this.pollTimer = setInterval(() => this.poll(win), POLL_SLACK_MS)
  }
}
