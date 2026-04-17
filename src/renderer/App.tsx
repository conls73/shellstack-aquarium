import { Component, type ReactNode } from 'react'
import AquariumCanvas from './aquarium/AquariumCanvas'
import SettingsDrawer from './ui/SettingsDrawer'
import { useFishSync } from './hooks/useFishSync'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error
      return (
        <div style={{ color: '#ff8888', background: '#0a1020', padding: 24, fontFamily: 'monospace', fontSize: 13, position: 'fixed', inset: 0, overflow: 'auto', zIndex: 9999 }}>
          <b style={{ fontSize: 16 }}>AquariumCanvas Error:</b><br /><br />
          <b>{err.message}</b><br /><br />
          <pre style={{ whiteSpace: 'pre-wrap', opacity: 0.7 }}>{err.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  useFishSync()

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <ErrorBoundary>
        <AquariumCanvas />
      </ErrorBoundary>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        <SettingsDrawer />
      </div>
    </div>
  )
}
