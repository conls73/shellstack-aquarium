import { Application } from 'pixi.js'

let app: Application | null = null
let initialized = false

export async function initPixiApp(canvas: HTMLCanvasElement): Promise<Application> {
  initialized = false
  app = new Application()
  await app.init({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    preference: 'webgl',
    powerPreference: 'default',
    // Required for screenshots and for the preview tool to capture frames
    preserveDrawingBuffer: true,
  })
  initialized = true
  return app
}

export function getPixiApp(): Application {
  if (!app || !initialized) throw new Error('PixiJS app not initialized')
  return app
}

export function destroyPixiApp() {
  if (app && initialized) {
    try {
      app.destroy(false, { children: true, texture: true })
    } catch {
      // Ignore destroy errors during cleanup races
    }
  }
  app = null
  initialized = false
}
