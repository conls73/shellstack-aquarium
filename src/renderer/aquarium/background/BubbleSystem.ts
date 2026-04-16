import { Container, Graphics, Ticker } from 'pixi.js'

interface Bubble {
  g: Graphics
  x: number
  y: number
  r: number
  speed: number
  phase: number
  drift: number
}

const BUBBLE_COUNT = 80

export function createBubbleSystem(w: number, h: number): { container: Container; tick: (ticker: Ticker) => void } {
  const container = new Container()
  const bubbles: Bubble[] = []

  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const r = 2 + Math.random() * 5
    const g = new Graphics()
    drawBubble(g, r)

    const b: Bubble = {
      g,
      x: Math.random() * w,
      y: Math.random() * h,
      r,
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.8,
    }
    g.position.set(b.x, b.y)
    container.addChild(g)
    bubbles.push(b)
  }

  const tick = (ticker: Ticker) => {
    const dt = ticker.deltaTime
    for (const b of bubbles) {
      b.phase += dt * 0.04
      b.y -= b.speed * dt
      b.x += Math.sin(b.phase) * b.drift * dt

      // Reset when bubble exits the top
      if (b.y < -b.r * 2) {
        b.y = h + b.r
        b.x = Math.random() * w
        b.phase = Math.random() * Math.PI * 2
      }
      // Wrap horizontally
      if (b.x < -b.r) b.x = w + b.r
      if (b.x > w + b.r) b.x = -b.r

      b.g.position.set(b.x, b.y)
    }
  }

  return { container, tick }
}

function drawBubble(g: Graphics, r: number) {
  // Bubble ring
  g.circle(0, 0, r)
    .stroke({ color: 0x88ccff, alpha: 0.55, width: 0.8 })
    .fill({ color: 0x4488aa, alpha: 0.07 })

  // Specular highlight — small white arc top-left
  g.arc(-r * 0.35, -r * 0.35, r * 0.28, Math.PI * 1.1, Math.PI * 1.9)
    .stroke({ color: 0xffffff, alpha: 0.7, width: 1.2 })
}
