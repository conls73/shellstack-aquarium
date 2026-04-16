import { useEffect } from 'react'
import { useFishStore } from '../store/fishStore'
import type { FishState } from '../../shared/types'
import { IPC } from '../../shared/constants'
import { calcNeglectScore } from '../aquarium/fish/neglect'

const BROWSER_DEMO_FISH: FishState[] = [
  { id: 'demo-1', source: 'demo', fishType: 'angelfish', unreadCount: 3, firstSeenUnreadAt: Date.now() - 3_600_000, lastAcknowledgedAt: 0, currentScale: 0.55, colorPhaseOffset: 0, neglectScore: 0, behaviorState: 'idle', label: '#general' },
  { id: 'demo-2', source: 'demo', fishType: 'goldfish', unreadCount: 12, firstSeenUnreadAt: Date.now() - 7_200_000, lastAcknowledgedAt: 0, currentScale: 0.9, colorPhaseOffset: 2.1, neglectScore: 0, behaviorState: 'idle', label: 'Gmail Inbox' },
  { id: 'demo-3', source: 'demo', fishType: 'angelfish', unreadCount: 25, firstSeenUnreadAt: Date.now() - 18_000_000, lastAcknowledgedAt: 0, currentScale: 1.4, colorPhaseOffset: 4.2, neglectScore: 0, behaviorState: 'annoyed', label: '@johnny' },
  { id: 'demo-4', source: 'demo', fishType: 'goldfish', unreadCount: 5, firstSeenUnreadAt: Date.now() - 1_800_000, lastAcknowledgedAt: 0, currentScale: 0.5, colorPhaseOffset: 1.0, neglectScore: 0, behaviorState: 'idle', label: 'Newsletter' },
  { id: 'demo-5', source: 'demo', fishType: 'angelfish', unreadCount: 40, firstSeenUnreadAt: Date.now() - 86_400_000, lastAcknowledgedAt: 0, currentScale: 1.7, colorPhaseOffset: 5.5, neglectScore: 0, behaviorState: 'annoyed', label: '#dev' },
].map(f => {
  const score = calcNeglectScore(f.unreadCount, f.firstSeenUnreadAt)
  return { ...f, neglectScore: score, behaviorState: score >= 5 ? 'annoyed' : 'idle' } as FishState
})

export function useFishSync() {
  const setFish = useFishStore(s => s.setFish)
  const upsertFish = useFishStore(s => s.upsertFish)

  useEffect(() => {
    // @ts-ignore
    if (!window.aquarium) {
      // Browser preview — seed with demo fish
      setFish(BROWSER_DEMO_FISH)
      return
    }
    // @ts-ignore
    window.aquarium.onFishUpdate((fish: FishState[]) => setFish(fish))
    // @ts-ignore
    window.aquarium.onFishDelta((fish: FishState) => upsertFish(fish))

    return () => {
      // @ts-ignore
      window.aquarium?.removeAllListeners(IPC.FISH_UPDATE)
      // @ts-ignore
      window.aquarium?.removeAllListeners(IPC.FISH_DELTA)
    }
  }, [setFish, upsertFish])
}
