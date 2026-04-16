import { Container, Graphics, Ticker } from 'pixi.js'

interface KelpStrand {
  g: Graphics
  segments: { x: number; y: number }[]
  baseX: number
  baseY: number
  phase: number
  height: number
}

export function createKelpLayer(w: number, h: number): { container: Container; tick: (ticker: Ticker) => void } {
  const container = new Container()
  container.alpha = 0.6
  const strands: KelpStrand[] = []
  const count = 10

  for (let i = 0; i < count; i++) {
    const strand = createKelpStrand(
      (i / count) * w + Math.random() * (w / count),
      h,
      70 + Math.random() * 100
    )
    strands.push(strand)
    container.addChild(strand.g)
  }

  const tick = (ticker: Ticker) => {
    const dt = ticker.deltaTime
    for (const s of strands) {
      s.phase += dt * 0.025
      redrawKelp(s)
    }
  }

  return { container, tick }
}

function createKelpStrand(baseX: number, baseY: number, height: number): KelpStrand {
  const segCount = 8
  const segments = Array.from({ length: segCount }, (_, i) => ({
    x: baseX,
    y: baseY - (i / segCount) * height,
  }))
  return {
    g: new Graphics(),
    segments,
    baseX,
    baseY,
    phase: Math.random() * Math.PI * 2,
    height,
  }
}

function redrawKelp(s: KelpStrand) {
  s.g.clear()
  const segCount = s.segments.length

  // Update segment positions with sine-wave sway
  for (let i = 1; i < segCount; i++) {
    const t = i / segCount
    s.segments[i].x = s.baseX + Math.sin(s.phase + t * 2.5) * t * 18
    s.segments[i].y = s.baseY - t * s.height + Math.cos(s.phase * 0.7 + t) * t * 5
  }

  // Draw as a thick ribbon
  for (let i = 0; i < segCount - 1; i++) {
    const curr = s.segments[i]
    const next = s.segments[i + 1]
    const t = i / segCount
    const thickness = 5 * (1 - t * 0.6)
    const green = Math.floor(120 + t * 60)
    s.g.moveTo(curr.x, curr.y)
    s.g.lineTo(next.x, next.y)
    s.g.stroke({ color: (0x00 << 16) | (green << 8) | 0x30, width: thickness, alpha: 0.75 })
  }
}
