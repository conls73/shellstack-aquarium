import { app } from 'electron'

type Resolver = (url: string) => void
const pending = new Map<string, { resolve: Resolver; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>()

export function setupDeepLinks() {
  app.setAsDefaultProtocolClient('shellstack')

  // Windows: deep link arrives as a second-instance argv
  app.on('second-instance', (_e, argv) => {
    const url = argv.find(a => a.startsWith('shellstack://'))
    if (url) dispatch(url)
  })

  // macOS
  app.on('open-url', (_e, url) => dispatch(url))
}

function dispatch(url: string) {
  try {
    const { pathname } = new URL(url)
    for (const [key, entry] of pending) {
      if (pathname.includes(key)) {
        clearTimeout(entry.timer)
        pending.delete(key)
        entry.resolve(url)
        return
      }
    }
  } catch {}
}

export function waitForDeepLink(pathKey: string, timeoutMs = 300_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(pathKey)
      reject(new Error('OAuth timed out'))
    }, timeoutMs)
    pending.set(pathKey, { resolve, reject, timer })
  })
}
