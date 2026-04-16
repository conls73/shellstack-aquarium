import { useState } from 'react'
import { useLicenseStore } from '../store/licenseStore'

const styles: Record<string, React.CSSProperties> = {
  trigger: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(10,30,60,0.7)',
    border: '1px solid rgba(60,140,200,0.3)',
    color: '#88ccee',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'all',
    transition: 'background 0.2s',
    userSelect: 'none',
  },
  drawer: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 280,
    background: 'linear-gradient(160deg, rgba(8,25,50,0.97) 0%, rgba(4,15,30,0.99) 100%)',
    border: '1px solid rgba(60,140,200,0.25)',
    borderRadius: 14,
    padding: '20px 24px',
    pointerEvents: 'all',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    color: '#cce8ff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  heading: {
    fontSize: 13,
    fontWeight: 600,
    color: '#557799',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    marginBottom: 16,
    margin: '0 0 16px',
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#88b8d8',
    marginBottom: 6,
    display: 'block',
  },
  connectBtn: {
    width: '100%',
    padding: '9px 0',
    background: 'rgba(15,50,90,0.8)',
    border: '1px solid rgba(60,140,200,0.35)',
    borderRadius: 8,
    color: '#88ccee',
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 8,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  divider: {
    height: 1,
    background: 'rgba(60,140,200,0.15)',
    margin: '16px 0',
  },
  version: {
    fontSize: 11,
    color: '#335566',
    marginTop: 12,
    textAlign: 'center' as const,
  },
}

export default function SettingsDrawer() {
  const [open, setOpen] = useState(false)
  const { isLicensed } = useLicenseStore()

  const connectSlack = () => {
    // @ts-ignore
    window.aquarium?.startOAuth({ provider: 'slack' })
  }
  const connectGmail = () => {
    // @ts-ignore
    window.aquarium?.startOAuth({ provider: 'gmail' })
  }

  return (
    <>
      <button
        style={styles.trigger}
        onClick={() => setOpen(o => !o)}
        title="Settings"
      >
        ⚙
      </button>

      {open && (
        <div style={styles.drawer}>
          <p style={styles.heading}>Connections</p>

          {isLicensed ? (
            <>
              <div style={styles.row}>
                <button style={styles.connectBtn} onClick={connectSlack}>
                  Connect Slack
                </button>
                <button style={styles.connectBtn} onClick={connectGmail}>
                  Connect Gmail
                </button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#557799', marginBottom: 16 }}>
              Unlock full aquarium to connect your accounts.
            </div>
          )}

          <div style={styles.divider} />

          <div style={{ fontSize: 13, color: '#88b8d8', lineHeight: 1.6 }}>
            <div>🐟 Angelfish = Slack DMs</div>
            <div>🐠 Goldfish = Gmail</div>
            <div style={{ marginTop: 6, color: '#446688' }}>
              Click a fish to acknowledge it.
            </div>
          </div>

          <div style={styles.version}>ShellStack Aquarium v0.1.0</div>
        </div>
      )}
    </>
  )
}
