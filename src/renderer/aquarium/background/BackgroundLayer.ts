import { Container, Sprite, Texture } from 'pixi.js'
import type { Application } from 'pixi.js'

export function createBackgroundLayer(app: Application): Container {
  const container = new Container()
  const w = app.screen.width
  const h = app.screen.height

  // Composite background: deep water gradient + radial vignette, all in one canvas
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Base deep-water radial gradient (lighter teal center → near-black edges)
  const waterGrad = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.max(w, h) * 0.8)
  waterGrad.addColorStop(0.0, '#0e4060')
  waterGrad.addColorStop(0.3, '#082d4a')
  waterGrad.addColorStop(0.65, '#051a2e')
  waterGrad.addColorStop(1.0, '#020b16')
  ctx.fillStyle = waterGrad
  ctx.fillRect(0, 0, w, h)

  // Vignette — radial gradient darkening toward all edges (no rectangle artifact)
  const vigGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72)
  vigGrad.addColorStop(0.0, 'rgba(0,0,0,0)')
  vigGrad.addColorStop(0.55, 'rgba(0,0,0,0.05)')
  vigGrad.addColorStop(0.8, 'rgba(0,0,0,0.38)')
  vigGrad.addColorStop(1.0, 'rgba(0,0,0,0.72)')
  ctx.fillStyle = vigGrad
  ctx.fillRect(0, 0, w, h)

  const texture = Texture.from(canvas)
  const bg = new Sprite(texture)
  bg.width = w
  bg.height = h
  container.addChild(bg)

  return container
}
