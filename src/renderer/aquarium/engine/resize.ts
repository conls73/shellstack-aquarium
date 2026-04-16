import type { Application } from 'pixi.js'

export function setupResize(app: Application, onResize?: (w: number, h: number) => void) {
  const handler = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    app.renderer.resize(w, h)
    onResize?.(w, h)
  }
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}
