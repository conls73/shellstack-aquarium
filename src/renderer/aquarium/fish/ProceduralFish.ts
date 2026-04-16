import { Container, Graphics, Ticker } from 'pixi.js'
import type { FishType } from '../../../shared/types'

interface ProceduralFishOptions {
  fishType: FishType
  scale?: number
}

export interface ProceduralFishInstance {
  container: Container
  tick: (ticker: Ticker, facingLeft: boolean, swimPhase: number, annoyedIntensity: number) => void
  setScale: (s: number) => void
}

// Apple-emoji-inspired palettes: bold, saturated, with outline + highlight
const CONFIG = {
  // 🐠 tropical fish style — yellow body, cyan stripes, pink fins
  angelfish: {
    bodyTop: 0xffd93d,      // bright yellow
    bodyBottom: 0xffb020,   // deeper orange-yellow belly
    stripe: 0x2b7fc9,       // bold cyan-blue
    finColor: 0xff6b9d,     // pink-magenta fins
    finDark: 0xd94f82,
    outline: 0x2a1e08,
    highlight: 0xffffff,
    bodyW: 46, bodyH: 54,
  },
  // 🐟 goldfish style — orange plump body, lighter belly
  goldfish: {
    bodyTop: 0xff7a2b,      // vibrant orange
    bodyBottom: 0xffb066,   // light orange belly
    stripe: 0xcc4a00,       // deep red-orange accent
    finColor: 0xff9040,
    finDark: 0xdd5e1a,
    outline: 0x3a1200,
    highlight: 0xfff2d0,
    bodyW: 52, bodyH: 38,
  },
}

export function createProceduralFish(options: ProceduralFishOptions): ProceduralFishInstance {
  const container = new Container()
  const tailFin = new Graphics()
  const pectoralFin = new Graphics()
  const bodyFill = new Graphics()
  const bodyMarks = new Graphics()
  const bodyOutline = new Graphics()
  const dorsalFin = new Graphics()
  const shine = new Graphics()
  const eye = new Graphics()

  // Draw order: back fins → body fill → markings → outline → dorsal → shine → eye
  container.addChild(tailFin)
  container.addChild(pectoralFin)
  container.addChild(bodyFill)
  container.addChild(bodyMarks)
  container.addChild(bodyOutline)
  container.addChild(dorsalFin)
  container.addChild(shine)
  container.addChild(eye)

  const drawAll = (swimPhase: number, facingLeft: boolean, annoyedIntensity: number) => {
    if (options.fishType === 'angelfish') {
      drawTropicalFish(
        { tailFin, pectoralFin, bodyFill, bodyMarks, bodyOutline, dorsalFin, shine, eye },
        swimPhase, facingLeft, annoyedIntensity
      )
    } else {
      drawGoldfish(
        { tailFin, pectoralFin, bodyFill, bodyMarks, bodyOutline, dorsalFin, shine, eye },
        swimPhase, facingLeft, annoyedIntensity
      )
    }
  }

  let swimPhase = Math.random() * Math.PI * 2
  let currentFacingLeft = false
  let currentAnnoyedIntensity = 0
  let frameSkip = 0

  drawAll(swimPhase, false, 0)

  const tick = (_ticker: Ticker, facingLeft: boolean, phase: number, annoyedIntensity: number) => {
    frameSkip++
    if (frameSkip % 2 !== 0) return

    const dirChanged = facingLeft !== currentFacingLeft
    const phaseChanged = Math.abs(phase - swimPhase) > 0.08
    const annoyedChanged = Math.abs(annoyedIntensity - currentAnnoyedIntensity) > 0.05

    if (dirChanged || phaseChanged || annoyedChanged) {
      swimPhase = phase
      currentFacingLeft = facingLeft
      currentAnnoyedIntensity = annoyedIntensity
      drawAll(swimPhase, currentFacingLeft, currentAnnoyedIntensity)
    }
  }

  const setScale = (s: number) => container.scale.set(s)
  if (options.scale) setScale(options.scale)

  return { container, tick, setScale }
}

interface Parts {
  tailFin: Graphics; pectoralFin: Graphics; bodyFill: Graphics
  bodyMarks: Graphics; bodyOutline: Graphics; dorsalFin: Graphics
  shine: Graphics; eye: Graphics
}

// 🐠 Tropical fish — yellow body, cyan vertical stripes, pink fins
function drawTropicalFish(p: Parts, swimPhase: number, facingLeft: boolean, annoyed: number) {
  const c = CONFIG.angelfish
  const dir = facingLeft ? -1 : 1
  const wag = Math.sin(swimPhase * 2.5) * (8 + annoyed * 10)
  const W = c.bodyW, H = c.bodyH

  // --- Tail fin: bold triangular swallow-tail ---
  p.tailFin.clear()
  const tx = -W * 0.62 * dir
  // Upper lobe
  p.tailFin.moveTo(tx + 4 * dir, -4)
  p.tailFin.lineTo(tx - 28 * dir + wag, -H * 0.55)
  p.tailFin.lineTo(tx - 12 * dir + wag * 0.6, -H * 0.15)
  p.tailFin.closePath()
  p.tailFin.fill({ color: c.finColor })
  p.tailFin.stroke({ color: c.outline, width: 2.5, alpha: 0.9 })
  // Lower lobe
  p.tailFin.moveTo(tx + 4 * dir, 4)
  p.tailFin.lineTo(tx - 28 * dir + wag, H * 0.55)
  p.tailFin.lineTo(tx - 12 * dir + wag * 0.6, H * 0.15)
  p.tailFin.closePath()
  p.tailFin.fill({ color: c.finDark })
  p.tailFin.stroke({ color: c.outline, width: 2.5, alpha: 0.9 })

  // --- Pectoral fin (side fin below eye) ---
  p.pectoralFin.clear()
  const pSway = Math.sin(swimPhase * 2) * 3
  p.pectoralFin.moveTo(W * 0.15 * dir, H * 0.08)
  p.pectoralFin.bezierCurveTo(
    W * 0.05 * dir, H * 0.35 + pSway,
    -W * 0.15 * dir, H * 0.42 + pSway,
    -W * 0.05 * dir, H * 0.28
  )
  p.pectoralFin.bezierCurveTo(
    W * 0.08 * dir, H * 0.22,
    W * 0.2 * dir, H * 0.14,
    W * 0.15 * dir, H * 0.08
  )
  p.pectoralFin.fill({ color: c.finColor })
  p.pectoralFin.stroke({ color: c.outline, width: 2, alpha: 0.85 })

  // --- Body: tall rounded diamond (tropical fish shape) ---
  p.bodyFill.clear()
  // Top half (yellow)
  p.bodyFill.moveTo(W * 0.68 * dir, 0)
  p.bodyFill.bezierCurveTo(
    W * 0.5 * dir, -H * 0.62,
    -W * 0.1 * dir, -H * 0.66,
    -W * 0.58 * dir, 0
  )
  p.bodyFill.lineTo(W * 0.68 * dir, 0)
  p.bodyFill.fill({ color: c.bodyTop })

  // Bottom half (slightly darker/deeper orange-yellow)
  p.bodyFill.moveTo(W * 0.68 * dir, 0)
  p.bodyFill.lineTo(-W * 0.58 * dir, 0)
  p.bodyFill.bezierCurveTo(
    -W * 0.1 * dir, H * 0.66,
    W * 0.5 * dir, H * 0.62,
    W * 0.68 * dir, 0
  )
  p.bodyFill.fill({ color: c.bodyBottom })

  // --- Bold cyan vertical stripes (clipped to body via overdraw pattern) ---
  p.bodyMarks.clear()
  const stripePositions = [0.35, -0.05, -0.42]
  for (const sp of stripePositions) {
    const sx = sp * W * dir
    // Stripe as thick rectangle, tapered top/bottom via bezier
    p.bodyMarks.moveTo(sx - 5, -H * 0.54)
    p.bodyMarks.bezierCurveTo(
      sx - 4, -H * 0.25,
      sx - 4, H * 0.25,
      sx - 5, H * 0.54
    )
    p.bodyMarks.lineTo(sx + 5, H * 0.54)
    p.bodyMarks.bezierCurveTo(
      sx + 4, H * 0.25,
      sx + 4, -H * 0.25,
      sx + 5, -H * 0.54
    )
    p.bodyMarks.closePath()
    p.bodyMarks.fill({ color: c.stripe, alpha: 0.85 })
  }

  // --- Body outline (bold cartoon/emoji look) ---
  p.bodyOutline.clear()
  p.bodyOutline.moveTo(W * 0.68 * dir, 0)
  p.bodyOutline.bezierCurveTo(
    W * 0.5 * dir, -H * 0.62,
    -W * 0.1 * dir, -H * 0.66,
    -W * 0.58 * dir, 0
  )
  p.bodyOutline.bezierCurveTo(
    -W * 0.1 * dir, H * 0.66,
    W * 0.5 * dir, H * 0.62,
    W * 0.68 * dir, 0
  )
  p.bodyOutline.stroke({ color: c.outline, width: 3, alpha: 0.95 })

  // --- Dorsal fin: tall sweeping triangular sail (emoji-style) ---
  p.dorsalFin.clear()
  const dp = Math.sin(swimPhase * 2.8) * 3
  p.dorsalFin.moveTo(-W * 0.45 * dir, -H * 0.55)
  p.dorsalFin.lineTo(-W * 0.1 * dir + dp, -H * 1.15)
  p.dorsalFin.lineTo(W * 0.45 * dir, -H * 0.55)
  p.dorsalFin.closePath()
  p.dorsalFin.fill({ color: c.finColor })
  p.dorsalFin.stroke({ color: c.outline, width: 2.5, alpha: 0.9 })
  // Inner fin detail line
  p.dorsalFin.moveTo(-W * 0.2 * dir, -H * 0.55)
  p.dorsalFin.lineTo(-W * 0.08 * dir + dp * 0.8, -H * 1.0)
  p.dorsalFin.stroke({ color: c.finDark, width: 1.5, alpha: 0.6 })

  // --- Glossy highlight arc (top of body) ---
  p.shine.clear()
  p.shine.moveTo(W * 0.1 * dir, -H * 0.5)
  p.shine.bezierCurveTo(
    W * 0.0 * dir, -H * 0.58,
    -W * 0.3 * dir, -H * 0.55,
    -W * 0.4 * dir, -H * 0.42
  )
  p.shine.stroke({ color: c.highlight, width: 4, alpha: 0.45 })

  // --- Eye: large emoji-style with big white highlight ---
  p.eye.clear()
  const eyeX = W * 0.44 * dir
  const eyeY = -H * 0.08
  p.eye.circle(eyeX, eyeY, 8).fill({ color: c.highlight })                   // white base
  p.eye.circle(eyeX, eyeY, 8).stroke({ color: c.outline, width: 2 })
  p.eye.circle(eyeX - 0.5 * dir, eyeY + 0.5, 5).fill({ color: c.outline })    // pupil
  p.eye.circle(eyeX - 1.8 * dir, eyeY - 1.8, 2).fill({ color: c.highlight })  // sparkle
}

// 🐟 Goldfish — plump orange body with lighter belly
function drawGoldfish(p: Parts, swimPhase: number, facingLeft: boolean, annoyed: number) {
  const c = CONFIG.goldfish
  const dir = facingLeft ? -1 : 1
  const wag = Math.sin(swimPhase * 2.5) * (10 + annoyed * 10)
  const W = c.bodyW, H = c.bodyH

  // --- Flowing tail (double-lobed swallow fan) ---
  p.tailFin.clear()
  const tx = -W * 0.58 * dir
  p.tailFin.moveTo(tx + 4 * dir, 0)
  p.tailFin.bezierCurveTo(
    tx - 12 * dir + wag * 0.4, -H * 0.35,
    tx - 30 * dir + wag, -H * 0.75,
    tx - 34 * dir + wag, -H * 0.15
  )
  p.tailFin.bezierCurveTo(
    tx - 22 * dir + wag * 0.7, -H * 0.1,
    tx - 10 * dir + wag * 0.4, -H * 0.05,
    tx + 4 * dir, 0
  )
  p.tailFin.fill({ color: c.finColor })
  p.tailFin.stroke({ color: c.outline, width: 2.5, alpha: 0.85 })

  p.tailFin.moveTo(tx + 4 * dir, 0)
  p.tailFin.bezierCurveTo(
    tx - 12 * dir + wag * 0.4, H * 0.35,
    tx - 30 * dir + wag, H * 0.75,
    tx - 34 * dir + wag, H * 0.15
  )
  p.tailFin.bezierCurveTo(
    tx - 22 * dir + wag * 0.7, H * 0.1,
    tx - 10 * dir + wag * 0.4, H * 0.05,
    tx + 4 * dir, 0
  )
  p.tailFin.fill({ color: c.finDark })
  p.tailFin.stroke({ color: c.outline, width: 2.5, alpha: 0.85 })

  // --- Pectoral fin ---
  p.pectoralFin.clear()
  const pSway = Math.sin(swimPhase * 2.2) * 4
  p.pectoralFin.moveTo(W * 0.1 * dir, H * 0.15)
  p.pectoralFin.bezierCurveTo(
    -W * 0.02 * dir, H * 0.42 + pSway,
    -W * 0.18 * dir, H * 0.46 + pSway,
    -W * 0.06 * dir, H * 0.3
  )
  p.pectoralFin.bezierCurveTo(
    W * 0.08 * dir, H * 0.22,
    W * 0.18 * dir, H * 0.18,
    W * 0.1 * dir, H * 0.15
  )
  p.pectoralFin.fill({ color: c.finColor })
  p.pectoralFin.stroke({ color: c.outline, width: 2, alpha: 0.8 })

  // --- Body: plump oval, split top/bottom for belly gradient ---
  p.bodyFill.clear()
  // Top (orange)
  p.bodyFill.moveTo(W * 0.7 * dir, 0)
  p.bodyFill.bezierCurveTo(
    W * 0.55 * dir, -H * 0.55,
    -W * 0.1 * dir, -H * 0.6,
    -W * 0.6 * dir, -H * 0.05
  )
  p.bodyFill.lineTo(-W * 0.6 * dir, 0)
  p.bodyFill.lineTo(W * 0.7 * dir, 0)
  p.bodyFill.fill({ color: c.bodyTop })

  // Bottom (lighter belly)
  p.bodyFill.moveTo(W * 0.7 * dir, 0)
  p.bodyFill.lineTo(-W * 0.6 * dir, 0)
  p.bodyFill.lineTo(-W * 0.6 * dir, H * 0.05)
  p.bodyFill.bezierCurveTo(
    -W * 0.1 * dir, H * 0.6,
    W * 0.55 * dir, H * 0.55,
    W * 0.7 * dir, 0
  )
  p.bodyFill.fill({ color: c.bodyBottom })

  // --- Gill mark + subtle scale suggestion ---
  p.bodyMarks.clear()
  // Gill arc near head
  p.bodyMarks.arc(W * 0.35 * dir, 0, H * 0.32, -1.2, 1.2)
  p.bodyMarks.stroke({ color: c.stripe, width: 2, alpha: 0.5 })

  // --- Body outline ---
  p.bodyOutline.clear()
  p.bodyOutline.moveTo(W * 0.7 * dir, 0)
  p.bodyOutline.bezierCurveTo(
    W * 0.55 * dir, -H * 0.55,
    -W * 0.1 * dir, -H * 0.6,
    -W * 0.6 * dir, -H * 0.05
  )
  p.bodyOutline.bezierCurveTo(
    -W * 0.62 * dir, 0,
    -W * 0.62 * dir, 0,
    -W * 0.6 * dir, H * 0.05
  )
  p.bodyOutline.bezierCurveTo(
    -W * 0.1 * dir, H * 0.6,
    W * 0.55 * dir, H * 0.55,
    W * 0.7 * dir, 0
  )
  p.bodyOutline.stroke({ color: c.outline, width: 3, alpha: 0.95 })

  // --- Dorsal fin: triangular sweeping back ---
  p.dorsalFin.clear()
  const dp = Math.sin(swimPhase * 3) * 3
  p.dorsalFin.moveTo(-W * 0.25 * dir, -H * 0.48)
  p.dorsalFin.lineTo(W * 0.1 * dir + dp, -H * 0.95)
  p.dorsalFin.lineTo(W * 0.45 * dir, -H * 0.48)
  p.dorsalFin.closePath()
  p.dorsalFin.fill({ color: c.finColor })
  p.dorsalFin.stroke({ color: c.outline, width: 2.5, alpha: 0.9 })

  // --- Glossy highlight arc (signature emoji shine on top of body) ---
  p.shine.clear()
  p.shine.moveTo(W * 0.2 * dir, -H * 0.42)
  p.shine.bezierCurveTo(
    W * 0.05 * dir, -H * 0.52,
    -W * 0.25 * dir, -H * 0.5,
    -W * 0.42 * dir, -H * 0.3
  )
  p.shine.stroke({ color: c.highlight, width: 4.5, alpha: 0.55 })

  // --- Eye ---
  p.eye.clear()
  const eyeX = W * 0.48 * dir
  const eyeY = -H * 0.08
  p.eye.circle(eyeX, eyeY, 7).fill({ color: c.highlight })
  p.eye.circle(eyeX, eyeY, 7).stroke({ color: c.outline, width: 2 })
  p.eye.circle(eyeX - 0.5 * dir, eyeY + 0.5, 4.2).fill({ color: c.outline })
  p.eye.circle(eyeX - 1.6 * dir, eyeY - 1.6, 1.8).fill({ color: c.highlight })
}
