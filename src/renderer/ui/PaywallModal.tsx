import { useState } from 'react'
import { useLicenseStore } from '../store/licenseStore'
import logoUrl from '../assets/ui/logo.png'

const CHECKOUT_URL = 'https://test.checkout.dodopayments.com/buy/pdt_0NcuoqmzEM2rFkZCh4ahN?quantity=1&redirect_url=https://shellstack.xyz/success'

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'all',
    background: 'radial-gradient(ellipse at center, rgba(5,20,40,0.82) 0%, rgba(2,10,20,0.92) 100%)',
    backdropFilter: 'blur(8px)',
    zIndex: 100,
  },
  plaque: {
    background: 'linear-gradient(160deg, rgba(10,40,70,0.95) 0%, rgba(5,20,40,0.98) 100%)',
    border: '1px solid rgba(80,160,220,0.35)',
    borderRadius: 20,
    padding: '28px 56px 44px',
    maxWidth: 560,
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 0 60px rgba(40,120,200,0.2), inset 0 1px 0 rgba(120,200,255,0.12)',
    color: '#cce8ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#e8f4ff',
    letterSpacing: '-0.5px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#88b8d8',
    margin: '0 0 32px',
    lineHeight: 1.6,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  fishPreview: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 32,
  },
  fishChip: {
    background: 'rgba(20,60,100,0.7)',
    border: '1px solid rgba(60,140,200,0.3)',
    borderRadius: 12,
    padding: '10px 16px',
    fontSize: 13,
    color: '#88ccee',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  input: {
    width: '100%',
    background: 'rgba(5,20,40,0.8)',
    border: '1px solid rgba(60,140,200,0.4)',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 14,
    color: '#cce8ff',
    outline: 'none',
    marginBottom: 16,
    fontFamily: 'monospace',
    letterSpacing: 2,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  buyButton: {
    width: '100%',
    padding: '14px 0',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #0e7a4a 0%, #085c36 100%)',
    color: '#e8fff4',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: 0.5,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 4px 20px rgba(20,160,80,0.3)',
    transition: 'opacity 0.2s',
    marginBottom: 12,
  },
  activateButton: {
    width: '100%',
    padding: '14px 0',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #1a6eb5 0%, #0d4a8a 100%)',
    color: '#e8f4ff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: 0.5,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 4px 20px rgba(20,100,200,0.35)',
    transition: 'opacity 0.2s',
  },
  errorMsg: {
    color: '#ff8888',
    fontSize: 13,
    marginBottom: 12,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  priceNote: {
    marginTop: 20,
    fontSize: 13,
    color: '#557799',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
}

export default function PaywallModal() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { activate } = useLicenseStore()

  const handleActivate = async () => {
    if (!key.trim()) return
    setLoading(true)
    setError('')
    const success = await activate(key.trim())
    setLoading(false)
    if (!success) setError('Invalid license key. Please check and try again.')
  }

  const handleBuy = () => {
    ;(window as any).aquarium.openExternal(CHECKOUT_URL)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.plaque}>
        <img
          src={logoUrl}
          alt="ShellStack"
          style={{
            width: 360,
            height: 360,
            margin: '-40px auto -30px',
            display: 'block',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 4px 16px rgba(40,120,200,0.4))',
          }}
        />
        <h1 style={styles.title}>ShellStack Aquarium</h1>
        <p style={styles.subtitle}>
          Your notifications live here now. Slack DMs become squids.<br />
          Emails become clownfish. Ignore them and they grow.
        </p>

        <div style={styles.fishPreview}>
          <div style={styles.fishChip}>🦑 Slack DMs → Squid</div>
          <div style={styles.fishChip}>🤡 Gmail → Clownfish</div>
        </div>

        <button style={styles.buyButton} onClick={handleBuy}>
          Buy Now · $5 One-Time
        </button>

        <input
          style={styles.input}
          placeholder="Enter license key"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleActivate()}
        />

        {error && <div style={styles.errorMsg}>{error}</div>}

        <button
          style={{ ...styles.activateButton, opacity: loading ? 0.6 : 1 }}
          onClick={handleActivate}
          disabled={loading}
        >
          {loading ? 'Activating…' : 'Unlock Full Aquarium'}
        </button>

        <div style={styles.priceNote}>
          One-time purchase · $5 · 2 devices included
        </div>
      </div>
    </div>
  )
}
