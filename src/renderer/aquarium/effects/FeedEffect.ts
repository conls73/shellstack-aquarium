import { Container, Graphics, Ticker } from 'pixi.js'

interface Particle {
  g: Graphics
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: number
}

export class FeedEffect {
  private container: Container
  private particles: Particle[] = []

  constructor() {
    this.container = new Container()
    this.container.eventMode = 'none'
  }

  getContainer(): Container {
    return this.container
  }

  burst(x: number, y: number, color = 0x88ddff) {
    const count = 18
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const speed = 1.5 + Math.random() * 2.5
      const g = new Graphics()
      this.container.addChild(g)
      this.particles.push({
        g, x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        maxLife: 1,
        color,
      })
    }
  }

  tick(ticker: Ticker) {
    const dt = ticker.deltaTime
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life -= dt * 0.04
      if (p.life <= 0) {
        this.container.removeChild(p.g)
        p.g.destroy()
        this.particles.splice(i, 1)
        continue
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.05 * dt
      p.g.clear()
      const r = 2 + p.life * 2
      p.g.circle(p.x, p.y, r).fill({ color: p.color, alpha: p.life })
    }
  }
}
