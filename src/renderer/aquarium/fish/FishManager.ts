import { Container, Ticker } from 'pixi.js'
import { createFishEntity } from './FishEntity'
import type { FishEntity } from './FishEntity'
import type { FishState } from '../../../shared/types'

export class FishManager {
  private container: Container
  private entities: Map<string, FishEntity> = new Map()
  private screenW = window.innerWidth
  private screenH = window.innerHeight

  constructor() {
    this.container = new Container()
  }

  getContainer(): Container {
    return this.container
  }

  syncFish(fishStates: FishState[]) {
    const incomingIds = new Set(fishStates.map(f => f.id))

    // Remove fish that are no longer present
    for (const [id, entity] of this.entities) {
      if (!incomingIds.has(id)) {
        this.container.removeChild(entity.container)
        entity.container.destroy({ children: true })
        this.entities.delete(id)
      }
    }

    // Add new fish or update existing
    for (const state of fishStates) {
      if (this.entities.has(state.id)) {
        this.entities.get(state.id)!.syncState(state)
      } else {
        const entity = createFishEntity(state)
        this.entities.set(state.id, entity)
        this.container.addChild(entity.container)
      }
    }
  }

  tick(ticker: Ticker) {
    for (const entity of this.entities.values()) {
      entity.update(ticker, this.screenW, this.screenH)
    }
  }

  resize(w: number, h: number) {
    this.screenW = w
    this.screenH = h
  }

  getFishAtPoint(x: number, y: number): string | null {
    for (const [id, entity] of this.entities) {
      const pos = entity.getPosition()
      const dx = x - pos.x
      const dy = y - pos.y
      if (Math.sqrt(dx * dx + dy * dy) < 45) return id
    }
    return null
  }
}
