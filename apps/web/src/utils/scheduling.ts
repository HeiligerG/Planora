export type Slot = { startISO: string; endISO: string }
export type Availability = Record<string /* ISO Date yyyy-mm-dd */, Slot[]>

export function distributeAcrossAvailability(
  availability: Availability,
  sessionMinutes: number,
  totalMinutes: number,
  hardGaps: Array<{ day: number; start: string; end: string }> = [],
) {
  const result: Slot[] = []
  let remaining = totalMinutes
  const minutes = (isoA: string, isoB: string) =>
    Math.round((new Date(isoB).getTime() - new Date(isoA).getTime()) / 60000)

  const clampByGaps = (slots: Slot[], dateStr: string) => {
    const day = new Date(dateStr).getDay() || 7 // Mo=1..So=7
    const gaps = hardGaps.filter(g => g.day === day)
    if (!gaps.length) return slots
    // simpel: filtere Slots, die komplett in verbotenen Zeiten liegen
    return slots.filter(s =>
      !gaps.some(g => {
        const a = `${dateStr}T${g.start}`
        const b = `${dateStr}T${g.end}`
        return !(s.endISO <= a || s.startISO >= b)
      }),
    )
  }

  const days = Object.keys(availability).sort()
  for (const d of days) {
    if (remaining <= 0) break
    const slots = clampByGaps(availability[d], d)

    for (const slot of slots) {
      if (remaining <= 0) break
      const span = minutes(slot.startISO, slot.endISO)
      if (span < sessionMinutes) continue

      // wie viele Sessions in diesen Slot passen?
      const count = Math.floor(span / sessionMinutes)
      for (let i = 0; i < count && remaining > 0; i++) {
        const start = new Date(slot.startISO)
        start.setMinutes(start.getMinutes() + i * sessionMinutes)
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + sessionMinutes)
        result.push({ startISO: start.toISOString(), endISO: end.toISOString() })
        remaining -= sessionMinutes
      }
    }
  }

  return { sessions: result, minutesUnplaced: Math.max(0, remaining) }
}