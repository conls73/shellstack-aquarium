import { getDB } from './db'
import { LICENSE_OFFLINE_DAYS } from '../../shared/constants'
import type { LicenseResult } from '../../shared/types'

const DODO_BASE = 'https://live.dodopayments.com'
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
    const resp = await fetch(`${DODO_BASE}/licenses/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: row.key,
        license_key_instance_id: row.instance_id || null,
      }),
    })
    const data = (await resp.json()) as { valid: boolean }

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

  try {
    const resp = await fetch(`${DODO_BASE}/licenses/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: key,
        name: 'ShellStack Aquarium',
      }),
    })

    if (resp.status === 201) {
      const data = (await resp.json()) as { id: string }
      db.prepare('UPDATE license SET key = ?, instance_id = ?, is_valid = 1, validated_at = ? WHERE id = 1').run(
        key,
        data.id,
        Date.now()
      )
      return { valid: true, trialMode: false, key }
    }
    return { valid: false, trialMode: true }
  } catch {
    return { valid: false, trialMode: true }
  }
}
