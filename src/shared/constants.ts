export const NEGLECT_ANNOYED_THRESHOLD = 5
export const NEGLECT_MAX_THRESHOLD = 15
export const FISH_MIN_SCALE = 0.4
export const FISH_MAX_SCALE = 1.8

export const POLL_SLACK_MS = 60_000
export const POLL_GMAIL_MS = 90_000

export const LICENSE_OFFLINE_DAYS = 30

export const IPC = {
  FISH_UPDATE: 'fish:update',
  FISH_DELTA: 'fish:delta',
  NOTIFICATION_ACKNOWLEDGE: 'notification:acknowledge',
  LICENSE_CHECK: 'license:check',
  LICENSE_RESULT: 'license:result',
  OAUTH_START: 'oauth:start',
  OAUTH_COMPLETE: 'oauth:complete',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  WINDOW_SET_ALWAYS_ON_TOP: 'window:setAlwaysOnTop',
  SHELL_OPEN_EXTERNAL: 'shell:openExternal',
} as const

export const DEMO_FISH_COUNT = 3

export const ANGELFISH_CONFIG = {
  fishType: 'angelfish' as const,
  baseColor: 0x88bbff,
  hueShiftSpeed: 0.3,
  baseSpeed: 1.2,
  annoyedSpeedMultiplier: 3,
}

export const GOLDFISH_CONFIG = {
  fishType: 'goldfish' as const,
  baseColor: 0xff8833,
  hueShiftSpeed: 0.2,
  baseSpeed: 1.0,
  annoyedSpeedMultiplier: 2.5,
}

export const CLOWNFISH_CONFIG = {
  fishType: 'clownfish' as const,
  baseColor: 0xff6622,
  hueShiftSpeed: 0.25,
  baseSpeed: 1.1,
  annoyedSpeedMultiplier: 2.8,
}

export const SQUID_CONFIG = {
  fishType: 'squid' as const,
  baseColor: 0xaa88ff,
  hueShiftSpeed: 0.4,
  baseSpeed: 0.9,
  annoyedSpeedMultiplier: 3.2,
}
