import { useEffect, useRef } from 'react'
import { Application, Ticker } from 'pixi.js'
import { initPixiApp, destroyPixiApp } from './engine/PixiApp'
import { setupResize } from './engine/resize'
import { createBackgroundLayer } from './background/BackgroundLayer'
import { createCausticLayer } from './background/CausticLayer'
import { createCoralLayer } from './background/CoralLayer'
import { createBubbleSystem } from './background/BubbleSystem'
import { createKelpLayer } from './background/KelpLayer'
import { FishManager } from './fish/FishManager'
import { RippleEffect } from './effects/RippleEffect'
import { FeedEffect } from './effects/FeedEffect'
import { useFishStore, fishStore } from '../store/fishStore'
import { useLicenseStore } from '../store/licenseStore'

export default function AquariumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fish = useFishStore(s => s.fish)
  const fishManagerRef = useRef<FishManager | null>(null)
  const feedEffectRef = useRef<FeedEffect | null>(null)
  const { isLicensed } = useLicenseStore()

  useEffect(() => {
    if (!canvasRef.current) return

    let app: Application
    let cleanupResize: (() => void) | undefined
    let feedEffect: FeedEffect
    let rippleEffect: RippleEffect
    let fishManager: FishManager
    let cancelled = false

    ;(async () => {
      app = await initPixiApp(canvasRef.current!)
      if (cancelled) return

      const w = app.screen.width
      const h = app.screen.height

      // Layer stack — back to front
      const bgLayer = createBackgroundLayer(app)
      app.stage.addChild(bgLayer)

      const { container: causticContainer, tick: causticTick } = createCausticLayer(app)
      app.stage.addChild(causticContainer)

      const { container: coralContainer } = createCoralLayer(w, h)
      app.stage.addChild(coralContainer)

      const { container: bubbleContainer, tick: bubbleTick } = createBubbleSystem(w, h)
      app.stage.addChild(bubbleContainer)

      fishManager = new FishManager()
      fishManagerRef.current = fishManager
      app.stage.addChild(fishManager.getContainer())
      // Sync any fish that arrived before PixiJS finished initializing
      fishManager.syncFish(fishStore.getState().fish)

      const { container: kelpContainer, tick: kelpTick } = createKelpLayer(w, h)
      app.stage.addChild(kelpContainer)

      rippleEffect = new RippleEffect()
      app.stage.addChild(rippleEffect.getContainer())

      feedEffect = new FeedEffect()
      feedEffectRef.current = feedEffect
      app.stage.addChild(feedEffect.getContainer())

      // Main game loop
      app.ticker.add((ticker: Ticker) => {
        causticTick(ticker)
        bubbleTick(ticker)
        kelpTick(ticker)
        fishManager.tick(ticker)
        rippleEffect.tick(ticker)
        feedEffect.tick(ticker)
      })

      // Mouse ripple effect
      app.stage.eventMode = 'static'
      app.stage.hitArea = app.screen
      let rippleThrottle = 0
      app.stage.on('mousemove', (e) => {
        rippleThrottle++
        if (rippleThrottle % 8 === 0) {
          rippleEffect.spawn(e.globalX, e.globalY)
        }
      })

      cleanupResize = setupResize(app, (nw, nh) => {
        fishManager.resize(nw, nh)
      })
    })()

    return () => {
      cancelled = true
      cleanupResize?.()
      destroyPixiApp()
      fishManagerRef.current = null
      feedEffectRef.current = null
    }
  }, [])

  // Sync fish state into the manager whenever it changes
  useEffect(() => {
    fishManagerRef.current?.syncFish(fish)
  }, [fish])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fishManagerRef.current) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (window.innerWidth / rect.width)
    const y = (e.clientY - rect.top) * (window.innerHeight / rect.height)
    const fishId = fishManagerRef.current.getFishAtPoint(x, y)
    if (fishId) {
      feedEffectRef.current?.burst(x, y, 0x88ddff)
      // @ts-ignore — exposed via preload
      window.aquarium?.acknowledge({ id: fishId, source: 'slack_dm' })
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'default',
      }}
    />
  )
}
