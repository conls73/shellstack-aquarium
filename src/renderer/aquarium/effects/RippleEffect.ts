import { Container, Graphics, Ticker } from 'pixi.js'

interface Ripple {
  g: Graphics
  r: number
  maxR: number
  alpha: number
  x: number
  y: number
}

export class RippleEffect {
  private container: Container
  private ripples: Ripple[] = []

  constructor() {
    this.container = new Container()
    this.container.eventMode = 'none'
  }

  getContainer(): Container {
    return this.container
  }

  spawn(x: number, y: number) {
    const g = new Graphics()
    this.container.addChild(g)
    this.ripples.push({ g, r: 5, maxR: 60, alpha: 0.5, x, y })
  }

  tick(ticker: Ticker) {
    const dt = ticker.deltaTime
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i]
      rip.r += dt * 1.8
      rip.alpha -= dt * 0.018
      if (rip.alpha <= 0) {
        this.container.removeChild(rip.g)
        rip.g.destroy()
        this.ripples.splice(i, 1)
        continue
      }
      rip.g.clear()
      rip.g.circle(rip.x, rip.y, rip.r)
        .stroke({ color: 0x88ccff, alpha: rip.alpha, width: 1.5 })
    }
  }
}
