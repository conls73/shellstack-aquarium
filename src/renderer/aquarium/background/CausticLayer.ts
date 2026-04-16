import { Container, Graphics } from 'pixi.js'
import type { Application, Ticker } from 'pixi.js'

interface CausticPatch {
  g: Graphics
  x: number
  y: number
  baseX: number
  baseY: number
  r: number
  phase: number
  speed: number
}

export function createCausticLayer(app: Application): { container: Container; tick: (ticker: Ticker) => void } {
  const container = new Container()
  const w = app.screen.width
  const h = app.screen.height

  // Caustic light patches — drawn directly as Graphics to avoid texture rectangle artifacts
  const patches: CausticPatch[] = []
  const count = 22

  for (let i = 0; i < count; i++) {
    const g = new Graphics()
    g.blendMode = 'add'
    container.addChild(g)
    patches.push({
      g,
      x: Math.random() * w,
      y: Math.random() * h * 0.65, // concentrate in upper 65% (light from above)
      baseX: Math.random() * w,
      baseY: Math.random() * h * 0.65,
      r: 30 + Math.random() * 80,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    })
  }

  let globalPhase = 0

  const tick = (ticker: Ticker) => {
    globalPhase += ticker.deltaTime * 0.008

    for (const p of patches) {
      p.phase += ticker.deltaTime * p.speed * 0.01
      p.x = p.baseX + Math.sin(p.phase * 0.8 + globalPhase) * 35
      p.y = p.baseY + Math.cos(p.phase * 0.6 + globalPhase * 0.7) * 20

      const alpha = 0.04 + Math.sin(p.phase * 1.3) * 0.025
      const r = p.r * (0.85 + Math.sin(p.phase * 2.1) * 0.15)

      p.g.clear()
      // Outer soft glow
      p.g.circle(p.x, p.y, r).fill({ color: 0x44aadd, alpha: Math.max(0, alpha * 0.4) })
      // Inner brighter core
      p.g.circle(p.x, p.y, r * 0.45).fill({ color: 0x88ccff, alpha: Math.max(0, alpha) })
    }
  }

  return { container, tick }
}
