export function calcNeglectScore(unreadCount: number, firstSeenUnreadAt: number): number {
  if (!firstSeenUnreadAt || unreadCount === 0) return 0
  const ageHours = (Date.now() - firstSeenUnreadAt) / 3_600_000
  return Math.log(1 + unreadCount) * Math.pow(ageHours, 0.7)
}
