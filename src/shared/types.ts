export type FishType = 'angelfish' | 'goldfish' | 'clownfish' | 'squid'
export type FishSource = 'slack_dm' | 'gmail' | 'demo'
export type FishBehaviorState = 'spawning' | 'idle' | 'annoyed' | 'crowding' | 'feeding'
export type FishRenderer = 'procedural' | 'sprite'

export interface FishState {
  id: string
  source: FishSource
  fishType: FishType
  unreadCount: number
  firstSeenUnreadAt: number
  lastAcknowledgedAt: number
  currentScale: number
  colorPhaseOffset: number
  neglectScore: number
  behaviorState: FishBehaviorState
  label: string
}

export interface LicenseResult {
  valid: boolean
  trialMode: boolean
  key?: string
}

export interface OAuthStartPayload {
  provider: 'slack' | 'gmail'
}

export interface OAuthCompletePayload {
  provider: 'slack' | 'gmail'
  success: boolean
  error?: string
}

export interface AcknowledgePayload {
  id: string
  source: FishSource
}

export interface AppSettings {
  slackPollIntervalMs: number
  gmailPollIntervalMs: number
  muted: boolean
  alwaysOnTop: boolean
  startWithWindows: boolean
  fishRenderer: FishRenderer
}
