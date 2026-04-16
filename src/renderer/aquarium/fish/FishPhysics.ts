export interface PhysicsState {
  x: number
  y: number
  vx: number
  vy: number
  targetX: number
  targetY: number
  targetTimer: number
  swimPhase: number
  facingLeft: boolean
}

export function createPhysics(x: number, y: number): PhysicsState {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 1,
    vy: (Math.random() - 0.5) * 0.5,
    targetX: x,
    targetY: y,
    targetTimer: 0,
    swimPhase: Math.random() * Math.PI * 2,
    facingLeft: Math.random() > 0.5,
  }
}

export function updatePhysics(
  p: PhysicsState,
  dt: number,
  screenW: number,
  screenH: number,
  speed: number,
  targetRefreshInterval: number
): void {
  p.targetTimer -= dt

  if (p.targetTimer <= 0) {
    // Pick a new random target biased toward center
    const cx = screenW / 2
    const cy = screenH / 2
    const spread = Math.min(screenW, screenH) * 0.35
    p.targetX = cx + (Math.random() - 0.5) * spread * 2
    p.targetY = cy + (Math.random() - 0.5) * spread * 1.2
    p.targetX = Math.max(80, Math.min(screenW - 80, p.targetX))
    p.targetY = Math.max(60, Math.min(screenH - 80, p.targetY))
    p.targetTimer = targetRefreshInterval + Math.random() * targetRefreshInterval * 0.5
  }

  // Steering force toward target
  const dx = p.targetX - p.x
  const dy = p.targetY - p.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const steerX = (dx / dist) * speed
  const steerY = (dy / dist) * speed

  p.vx += (steerX - p.vx) * 0.03 * dt
  p.vy += (steerY - p.vy) * 0.03 * dt

  // Small random perturbation for organic feel
  p.vx += (Math.random() - 0.5) * 0.08
  p.vy += (Math.random() - 0.5) * 0.04

  // Clamp speed
  const v = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1
  const maxSpeed = speed * 1.8
  if (v > maxSpeed) {
    p.vx = (p.vx / v) * maxSpeed
    p.vy = (p.vy / v) * maxSpeed
  }

  p.x += p.vx * dt
  p.y += p.vy * dt

  // Soft boundary repulsion
  const margin = 60
  if (p.x < margin) p.vx += 0.15 * dt
  if (p.x > screenW - margin) p.vx -= 0.15 * dt
  if (p.y < margin) p.vy += 0.1 * dt
  if (p.y > screenH - margin) p.vy -= 0.1 * dt

  // Clamp
  p.x = Math.max(40, Math.min(screenW - 40, p.x))
  p.y = Math.max(40, Math.min(screenH - 40, p.y))

  // Update facing direction based on horizontal velocity
  if (Math.abs(p.vx) > 0.1) {
    p.facingLeft = p.vx < 0
  }

  // Swim phase
  p.swimPhase += dt * 0.08
}
