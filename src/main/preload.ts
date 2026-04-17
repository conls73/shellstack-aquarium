import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/constants'
import type {
  FishState,
  LicenseResult,
  OAuthStartPayload,
  OAuthCompletePayload,
  AcknowledgePayload,
  AppSettings,
} from '../shared/types'

contextBridge.exposeInMainWorld('aquarium', {
  onFishUpdate: (cb: (fish: FishState[]) => void) =>
    ipcRenderer.on(IPC.FISH_UPDATE, (_e, fish) => cb(fish)),

  onFishDelta: (cb: (fish: FishState) => void) =>
    ipcRenderer.on(IPC.FISH_DELTA, (_e, fish) => cb(fish)),

  onOAuthComplete: (cb: (payload: OAuthCompletePayload) => void) =>
    ipcRenderer.on(IPC.OAUTH_COMPLETE, (_e, payload) => cb(payload)),

  onLicenseResult: (cb: (result: LicenseResult) => void) =>
    ipcRenderer.on(IPC.LICENSE_RESULT, (_e, result) => cb(result)),

  acknowledge: (payload: AcknowledgePayload) =>
    ipcRenderer.send(IPC.NOTIFICATION_ACKNOWLEDGE, payload),

  checkLicense: () => ipcRenderer.send(IPC.LICENSE_CHECK),

  startOAuth: (payload: OAuthStartPayload) =>
    ipcRenderer.send(IPC.OAUTH_START, payload),

  getSettings: (): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC.SETTINGS_GET),

  setSettings: (settings: Partial<AppSettings>): Promise<void> =>
    ipcRenderer.invoke(IPC.SETTINGS_SET, settings),

  setAlwaysOnTop: (value: boolean) =>
    ipcRenderer.send(IPC.WINDOW_SET_ALWAYS_ON_TOP, value),

  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),

  openExternal: (url: string) =>
    ipcRenderer.send(IPC.SHELL_OPEN_EXTERNAL, url),
})
