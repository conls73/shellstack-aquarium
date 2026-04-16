import { BrowserWindow } from 'electron'
import { getDB } from './db'
import { IPC, NEGLECT_ANNOYED_THRESHOLD, NEGLECT_MAX_THRESHOLD, FISH_MIN_SCALE, FISH_MAX_SCALE, DEMO_FISH_COUNT } from '../../shared/constants'
import type { FishState, FishSource, FishType, FishBehaviorState } from '../../shared/types'

const DEMO_FISH: Omit<FishState, 'neglectScore' | 'behaviorState'>[] = [
  { id: 'demo-1', source: 'demo', fishType: 'angelfish', unreadCount: 3, firstSeenUnreadAt: Date.now() - 3600_000, lastAcknowledgedAt: 0, currentScale: 0.6, colorPhaseOffset: 0, label: 'Demo DM' },
  { id: 'demo-2', source: 'demo', fishType: 'goldfish', unreadCount: 8, firstSeenUnreadAt: Date.now() - 7200_000, lastAcknowledgedAt: 0, currentScale: 1.0, colorPhaseOffset: 2.1, label: 'Demo Email' },
  { id: 'demo-3', source: 'demo', fishType: 'angelfish', unreadCount: 20, firstSeenUnreadAt: Date.now() - 14400_000, lastAcknowledgedAt: 0, currentScale: 1.6, colorPhaseOffset: 4.2, label: 'Demo DM 2' },
]

export function calcNeglectScore(unreadCount: number, firstSeenUnreadAt: number): number {
  if (!firstSeenUnreadAt || unreadCount === 0) return 0
  const ageHours = (Date.now() - firstSeenUnreadAt) / 3_600_000
  return Math.log(1 + unreadCount) * Math.pow(ageHours, 0.7)
}

function neglectToScale(score: number): number {
  return Math.min(FISH_MAX_SCALE, Math.max(FISH_MIN_SCALE, FISH_MIN_SCALE + score * 0.08))
}

function neglectToBehavior(score: number): FishBehaviorState {
  if (score >= NEGLECT_ANNOYED_THRESHOLD) return 'annoyed'
  return 'idle'
}

export class FishService {
  private isLicensed = false

  setLicensed(value: boolean) {
    this.isLicensed = value
  }

  upsertNotification(id: string, source: FishSource, fishType: FishType, unreadCount: number, label: string) {
    const db = getDB()
    const existing = db.prepare('SELECT * FROM fish_state WHERE id = ?').get(id) as
      | { first_seen_unread_at: number; color_phase_offset: number }
      | undefined

    const now = Date.now()
    const firstSeen = existing?.first_seen_unread_at ?? now
    const phaseOffset = existing?.color_phase_offset ?? Math.random() * Math.PI * 2

    db.prepare(`
      INSERT INTO fish_state (id, source, fish_type, unread_count, first_seen_unread_at, last_acknowledged_at, current_scale, color_phase_offset, label)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET unread_count = ?, label = ?
    `).run(id, source, fishType, unreadCount, firstSeen, neglectToScale(calcNeglectScore(unreadCount, firstSeen)), phaseOffset, label, unreadCount, label)
  }

  acknowledge(id: string) {
    const db = getDB()
    db.prepare('DELETE FROM fish_state WHERE id = ?').run(id)
  }

  getAllFish(): FishState[] {
    if (!this.isLicensed) {
      return DEMO_FISH.map(f => {
        const score = calcNeglectScore(f.unreadCount, f.firstSeenUnreadAt)
        return { ...f, neglectScore: score, behaviorState: neglectToBehavior(score) }
      })
    }

    const db = getDB()
    const rows = db.prepare('SELECT * FROM fish_state').all() as {
      id: string; source: FishSource; fish_type: FishType
      unread_count: number; first_seen_unread_at: number
      last_acknowledged_at: number; current_scale: number
      color_phase_offset: number; label: string
    }[]

    return rows.map(r => {
      const score = calcNeglectScore(r.unread_count, r.first_seen_unread_at)
      return {
        id: r.id,
        source: r.source,
        fishType: r.fish_type,
        unreadCount: r.unread_count,
        firstSeenUnreadAt: r.first_seen_unread_at,
        lastAcknowledgedAt: r.last_acknowledged_at,
        currentScale: neglectToScale(score),
        colorPhaseOffset: r.color_phase_offset,
        neglectScore: score,
        behaviorState: neglectToBehavior(score),
        label: r.label,
      }
    })
  }

  startPolling(win: BrowserWindow) {
    const push = () => {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC.FISH_UPDATE, this.getAllFish())
      }
    }
    // Push immediately on start
    push()
    // Then push whenever fish state might change (external callers update via upsertNotification)
    setInterval(push, 30_000)
  }

  pushUpdate(win: BrowserWindow) {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC.FISH_UPDATE, this.getAllFish())
    }
  }
}
