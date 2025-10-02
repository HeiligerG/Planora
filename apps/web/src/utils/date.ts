export function startOfWeekISO(offsetWeeks = 0) {
  const now = new Date()
  const dow = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - dow + offsetWeeks * 7)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

export function endOfWeekISO(weekStartISO: string) {
  const monday = new Date(weekStartISO)
  const sundayEnd = new Date(monday)
  sundayEnd.setDate(monday.getDate() + 7)
  sundayEnd.setHours(23, 59, 59, 999)
  return sundayEnd.toISOString()
}

export function weekLabel(weekStartISO: string) {
  const d = new Date(weekStartISO)
  const n = getISOWeekNumber(d)
  return `Woche ${n}`
}

export function getISOWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const diff = date.valueOf() - firstThursday.valueOf()
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000))
}

export function dayIndex(weekStartISO: string, iso: string) {
  const a = new Date(weekStartISO).getTime()
  const b = new Date(iso).getTime()
  return Math.floor((b - a) / (24 * 3600 * 1000))
}

export function toInputDateTime(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${hh}:${mm}`
}

export function fmtTimeRange(aISO: string, bISO: string) {
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  const s = new Date(aISO).toLocaleTimeString('de-CH', opts)
  const e = new Date(bISO).toLocaleTimeString('de-CH', opts)
  return `${s}–${e}`
}

export function minutesBetween(aISO: string, bISO: string) {
  return Math.max(
    0,
    Math.round((new Date(bISO).getTime() - new Date(aISO).getTime()) / 60000),
  )
}