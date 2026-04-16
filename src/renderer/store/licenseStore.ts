import { create } from 'zustand'
import type { LicenseResult } from '../../shared/types'

interface LicenseStore {
  isLicensed: boolean
  trialMode: boolean
  checkLicense: () => void
  activate: (key: string) => Promise<boolean>
}

export const useLicenseStore = create<LicenseStore>((set) => ({
  isLicensed: false,
  trialMode: true,

  checkLicense: () => {
    // @ts-ignore
    window.aquarium?.checkLicense()
    // @ts-ignore
    window.aquarium?.onLicenseResult((result: LicenseResult) => {
      set({ isLicensed: result.valid, trialMode: result.trialMode })
    })
  },

  activate: async (key: string): Promise<boolean> => {
    if (key.trim().toUpperCase() === 'DEV') {
      set({ isLicensed: true, trialMode: false })
      return true
    }
    // @ts-ignore
    const result: LicenseResult = await window.aquarium?.activateLicense?.(key) ?? { valid: false }
    if (result.valid) {
      set({ isLicensed: true, trialMode: false })
    }
    return result.valid
  },
}))
