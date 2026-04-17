import http from 'http'
import type { FishService } from './services/fish.service'
import type { BrowserWindow } from 'electron'

export const NOTIFICATION_PORT = 47392

export function startNotificationServer(fishService: FishService, win: BrowserWindow) {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
    if (req.method !== 'POST' || req.url !== '/notifications') {
      res.writeHead(404); res.end(); return
    }

    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const { source, count } = JSON.parse(body) as { source: string; count: number }
        if (source === 'gmail') {
          if (count > 0) fishService.upsertNotification('gmail_inbox', 'gmail', 'clownfish', count, 'Gmail Inbox')
          else fishService.acknowledge('gmail_inbox')
        } else if (source === 'slack') {
          if (count > 0) fishService.upsertNotification('slack_unread', 'slack_dm', 'squid', count, 'Slack')
          else fishService.acknowledge('slack_unread')
        }
        fishService.pushUpdate(win)
        res.writeHead(200); res.end('ok')
      } catch {
        res.writeHead(400); res.end('bad request')
      }
    })
  })

  server.listen(NOTIFICATION_PORT)
}
