import { getDB } from './db'
import { LICENSE_OFFLINE_DAYS } from '../../shared/constants'
import type { LicenseResult } from '../../shared/types'

const LS_VALIDATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/validate'
const OFFLINE_MS = LICENSE_OFFLINE_DAYS * 24 * 3600_000

export async function checkLicense(): Promise<LicenseResult> {
  const db = getDB()
  const row = db.prepare('SELECT * FROM license WHERE id = 1').get() as
    | { key: string | null; instance_id: string; validated_at: number | null; is_valid: number }
    | undefined

  if (!row?.key) {
    return { valid: false, trialMode: true }
  }

  // Offline grace period
  if (row.is_valid && row.validated_at && Date.now() - row.validated_at < OFFLINE_MS) {
    return { valid: true, trialMode: false, key: row.key }
  }

  try {
    const resp = await fetch(LS_VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        license_key: row.key,
        instance_id: row.instance_id,
      }),
    })
    const data = (await resp.json()) as { valid: boolean; error?: string }

    if (data.valid) {
      db.prepare('UPDATE license SET is_valid = 1, validated_at = ? WHERE id = 1').run(Date.now())
      return { valid: true, trialMode: false, key: row.key }
    }
    db.prepare('UPDATE license SET is_valid = 0 WHERE id = 1').run()
    return { valid: false, trialMode: true }
  } catch {
    // Network error — fall back to cached result
    if (row.is_valid && row.validated_at) {
      return { valid: true, trialMode: false, key: row.key }
    }
    return { valid: false, trialMode: true }
  }
}

export async function activateLicense(key: string): Promise<LicenseResult> {
  const db = getDB()
  const { instance_id } = db.prepare('SELECT instance_id FROM license WHERE id = 1').get() as {
    instance_id: string
  }

  try {
    const resp = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        license_key: key,
        instance_name: 'ShellStack Aquarium',
        instance_id,
      }),
    })
    const data = (await resp.json()) as { activated: boolean; error?: string }

    if (data.activated) {
      db.prepare('UPDATE license SET key = ?, is_valid = 1, validated_at = ? WHERE id = 1').run(
        key,
        Date.now()
      )
      return { valid: true, trialMode: false, key }
    }
    return { valid: false, trialMode: true }
  } catch {
    return { valid: false, trialMode: true }
  }
}
