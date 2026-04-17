import { Assets, Container, Sprite, Ticker } from 'pixi.js'
import type { FishType } from '../../../shared/types'
import angelfishUrl from '../../assets/fish/angelfish.png'
import goldfishUrl from '../../assets/fish/goldfish.png'
import clownfishUrl from '../../assets/fish/clownfish.png'
import squidUrl from '../../assets/fish/squid.png'

interface SpriteFishOptions {
  fishType: FishType
  scale?: number
}

export interface SpriteFishInstance {
  container: Container
  tick: (ticker: Ticker, facingLeft: boolean, swimPhase: number, annoyedIntensity: number) => void
  setScale: (s: number) => void
}

const SOURCE: Record<FishType, string> = {
  angelfish: angelfishUrl,
  goldfish: goldfishUrl,
  clownfish: clownfishUrl,
  squid: squidUrl,
}

const BASE_SCALE: Record<FishType, number> = {
  angelfish: 1.6,
  goldfish: 1.6,
  clownfish: 1.6,
  squid: 1.6,
}

export function createSpriteFish(options: SpriteFishOptions): SpriteFishInstance {
  const container = new Container()
  const inner = new Container()
  container.addChild(inner)

  const sprite = new Sprite()
  sprite.anchor.set(0.5)
  // Keep pixel-art crisp (nearest-neighbor)
  ;(sprite as any).roundPixels = true
  inner.addChild(sprite)

  // Load texture asynchronously; sprite renders once ready
  Assets.load(SOURCE[options.fishType]).then(tex => {
    // @ts-ignore
    tex.source.scaleMode = 'nearest'
    sprite.texture = tex
  })

  const base = BASE_SCALE[options.fishType]
  inner.scale.set(base)

  const tick = (_ticker: Ticker, facingLeft: boolean, swimPhase: number, annoyedIntensity: number) => {
    // Face direction (sprites face right by default — flip X when facing left)
    inner.scale.x = (facingLeft ? -base : base)

    // Subtle body squash/wiggle to fake swim animation on a static sprite
    const wiggle = Math.sin(swimPhase * 3) * (0.04 + annoyedIntensity * 0.05)
    inner.scale.y = base * (1 + wiggle)
    inner.rotation = Math.sin(swimPhase * 1.5) * (0.04 + annoyedIntensity * 0.05)
  }

  const setScale = (s: number) => container.scale.set(s)
  if (options.scale) setScale(options.scale)

  return { container, tick, setScale }
}
