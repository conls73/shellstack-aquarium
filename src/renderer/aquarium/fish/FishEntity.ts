import { Container, ColorMatrixFilter, Graphics, Ticker, Filter } from 'pixi.js'
import { GlowFilter } from 'pixi-filters'
import { createSpriteFish } from './SpriteFish'
import { createPhysics, updatePhysics } from './FishPhysics'
import type { PhysicsState } from './FishPhysics'
import { NEGLECT_ANNOYED_THRESHOLD } from '../../../shared/constants'
import type { FishState } from '../../../shared/types'
import { ANGELFISH_CONFIG, GOLDFISH_CONFIG } from '../../../shared/constants'

export interface FishEntity {
  container: Container
  update: (ticker: Ticker, screenW: number, screenH: number) => void
  syncState: (state: FishState) => void
  getId: () => string
  getPosition: () => { x: number; y: number }
}

export function createFishEntity(initialState: FishState): FishEntity {
  const cfg = initialState.fishType === 'angelfish' ? ANGELFISH_CONFIG : GOLDFISH_CONFIG

  const outerContainer = new Container()
  outerContainer.eventMode = 'static'
  outerContainer.cursor = 'pointer'

  // Soft diffused drop shadow — blurred via multiple stacked low-alpha ellipses
  const shadow = new Graphics()
  shadow.ellipse(0, 46, 40, 9).fill({ color: 0x000000, alpha: 0.08 })
  shadow.ellipse(0, 46, 32, 7).fill({ color: 0x000000, alpha: 0.08 })
  shadow.ellipse(0, 46, 24, 5).fill({ color: 0x000000, alpha: 0.08 })
  outerContainer.addChild(shadow)

  // The actual fish graphics
  const fish = createSpriteFish({ fishType: initialState.fishType, scale: initialState.currentScale })
  outerContainer.addChild(fish.container)

  // Very subtle hue-shift only (keep emoji-style colors pure)
  const colorMatrix = new ColorMatrixFilter()
  fish.container.filters = [colorMatrix]

  // Soft ambient glow — low strength so it reads as underwater light, not neon
  const glow = new GlowFilter({ distance: 10, outerStrength: 0.25, innerStrength: 0, color: 0x88ccff, quality: 0.3 })
  outerContainer.filters = [glow]

  // Physics — spread across screen with some initial velocity
  const physics = createPhysics(
    80 + Math.random() * (window.innerWidth - 160),
    80 + Math.random() * (window.innerHeight - 200)
  )

  let currentState: FishState = { ...initialState }
  let huePhase = initialState.colorPhaseOffset
  let spawnAlpha = 0
  let isSpawning = true

  const update = (ticker: Ticker, screenW: number, screenH: number) => {
    const dt = ticker.deltaTime
    const annoyedIntensity = Math.max(0, Math.min(1, (currentState.neglectScore - NEGLECT_ANNOYED_THRESHOLD) / 10))
    const isAnnoyed = currentState.neglectScore >= NEGLECT_ANNOYED_THRESHOLD

    // Spawn fade-in
    if (isSpawning) {
      spawnAlpha += dt * 0.04
      outerContainer.alpha = Math.min(1, spawnAlpha)
      if (spawnAlpha >= 1) isSpawning = false
    }

    // Physics update
    const speed = cfg.baseSpeed * (isAnnoyed ? cfg.annoyedSpeedMultiplier : 1) * 0.8
    const targetInterval = isAnnoyed ? 60 : 180
    updatePhysics(physics, dt, screenW, screenH, speed, targetInterval)

    outerContainer.position.set(physics.x, physics.y)

    // Update fish scale to match state
    fish.setScale(currentState.currentScale)
    shadow.scale.set(currentState.currentScale)

    // Hue shift for iridescence
    huePhase += dt * cfg.hueShiftSpeed * 0.02
    applyHueShift(colorMatrix, huePhase, currentState.fishType)

    // Glow intensity based on neglect — stays soft even when annoyed
    glow.outerStrength = 0.25 + annoyedIntensity * 0.9
    glow.color = isAnnoyed ? 0xff8855 : 0x88ccff

    // Tick the fish graphics
    fish.tick(ticker, physics.facingLeft, physics.swimPhase, annoyedIntensity)
  }

  const syncState = (state: FishState) => {
    currentState = state
  }

  return {
    container: outerContainer,
    update,
    syncState,
    getId: () => initialState.id,
    getPosition: () => ({ x: physics.x, y: physics.y }),
  }
}

function applyHueShift(filter: ColorMatrixFilter, phase: number, _fishType: string) {
  // Very subtle brightness pulse only — keeps emoji colors pure
  filter.reset()
  filter.brightness(1 + Math.sin(phase * 1.1) * 0.04, false)
}
