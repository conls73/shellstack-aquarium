import { Container, Graphics, Ticker } from 'pixi.js'

export function createCoralLayer(w: number, h: number): { container: Container; tick: (ticker: Ticker) => void } {
  const container = new Container()

  // Far coral — small, low opacity, anchored to bottom
  const farGroup = new Container()
  farGroup.alpha = 0.25
  for (let i = 0; i < 12; i++) {
    const coral = drawCoral(0x1a6644, 18 + Math.random() * 22)
    coral.position.set(
      (i / 12) * w + Math.random() * (w / 12),
      h - 20 - Math.random() * 30
    )
    farGroup.addChild(coral)
  }
  container.addChild(farGroup)

  // Mid coral — larger, slightly more opaque
  const midGroup = new Container()
  midGroup.alpha = 0.45
  for (let i = 0; i < 8; i++) {
    const coral = drawCoral(0x2d8c5a, 28 + Math.random() * 35)
    coral.position.set(
      (i / 8) * w + Math.random() * (w / 8),
      h - 15 - Math.random() * 25
    )
    midGroup.addChild(coral)
  }
  container.addChild(midGroup)

  // Rocks along the bottom
  const rockGroup = new Container()
  for (let i = 0; i < 16; i++) {
    const rock = drawRock(0x1a2535, 0x263545, 20 + Math.random() * 35)
    rock.position.set(
      (i / 16) * w + Math.random() * (w / 16),
      h - 5 - Math.random() * 15
    )
    rockGroup.addChild(rock)
  }
  container.addChild(rockGroup)

  const tick = (_ticker: Ticker) => {
    // Parallax: far moves slower when we implement camera; static for now
  }

  return { container, tick }
}

function drawCoral(color: number, height: number): Graphics {
  const g = new Graphics()
  const branches = 3 + Math.floor(Math.random() * 3)
  for (let b = 0; b < branches; b++) {
    const angle = ((b / branches) - 0.5) * Math.PI * 0.8 - Math.PI / 2
    const len = height * (0.6 + Math.random() * 0.4)
    const ex = Math.cos(angle) * len
    const ey = Math.sin(angle) * len
    g.moveTo(0, 0)
    g.lineTo(ex, ey)
    g.stroke({ color, width: 3 - b * 0.3, alpha: 0.9 })

    // Sub-branches
    for (let s = 0; s < 2; s++) {
      const t = 0.5 + s * 0.3
      const sx = ex * t
      const sy = ey * t
      const sa = angle + (Math.random() - 0.5) * 1.2
      const sl = len * 0.4
      g.moveTo(sx, sy)
      g.lineTo(sx + Math.cos(sa) * sl, sy + Math.sin(sa) * sl)
      g.stroke({ color, width: 1.5, alpha: 0.7 })
    }
  }
  return g
}

function drawRock(colorDark: number, colorLight: number, size: number): Graphics {
  const g = new Graphics()
  const w = size * (0.8 + Math.random() * 0.6)
  const h = size * (0.4 + Math.random() * 0.3)
  g.ellipse(0, 0, w / 2, h / 2).fill({ color: colorDark, alpha: 0.85 })
  // Highlight edge
  g.ellipse(-w * 0.1, -h * 0.15, w * 0.3, h * 0.2).fill({ color: colorLight, alpha: 0.25 })
  return g
}
