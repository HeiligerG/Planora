import { useMutation } from '@tanstack/react-query'
import { CreateStudySessionDto, StudySession } from '../lib/api'

/* ========================== Week helpers ========================== */

export function useWeekRange(offset: number) {
  const now = new Date()
  const dow = (now.getDay() + 6) % 7 // Mo=0
  const monday = new Date(now)
  monday.setDate(now.getDate() - dow + offset * 7)
  monday.setHours(0, 0, 0, 0)

  const sundayEnd = new Date(monday)
  sundayEnd.setDate(monday.getDate() + 7)
  sundayEnd.setHours(23, 59, 59, 999)

  const startISO = monday.toISOString()
  const endISO = sundayEnd.toISOString()
  const weekNumber = getWeekNumber(monday)

  return { monday, startISO, endISO, label: `Woche ${weekNumber}` }
}

/** Template-Item für wiederkehrende Slots innerhalb einer Woche */
export type WeekTemplateItem = {
  dayOffset: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0=Mo
  hh: number
  mm: number
  minutes: number
  title: string
  notes?: string
}

/** Erzeugt DTOs aus einem Wochen-Template */
export function planFromTemplate(
  monday: Date,
  items: WeekTemplateItem[]
): CreateStudySessionDto[] {
  return items.map((i) => {
    const start = isoAt(addDays(monday, i.dayOffset), i.hh, i.mm)
    const end = isoAddMinutes(start, i.minutes)
    return { title: i.title, scheduledStart: start, scheduledEnd: end, notes: i.notes }
  })
}

/** Prüft Konflikte gegen bestehende Sessions – Option: dropConflicts=true verwirft Slots */
export function avoidConflicts(
  planned: CreateStudySessionDto[],
  existing: Pick<StudySession, 'scheduledStart' | 'scheduledEnd'>[],
  options: { dropConflicts?: boolean } = { dropConflicts: true }
): CreateStudySessionDto[] {
  const result: CreateStudySessionDto[] = []
  for (const p of planned) {
    const hasOverlap = existing.some((e) =>
      overlaps(p.scheduledStart, p.scheduledEnd, e.scheduledStart, e.scheduledEnd)
    )
    if (!hasOverlap) {
      result.push(p)
    } else if (!options.dropConflicts) {
      // einfache Ausweich-Strategie: verschiebe um 60min (max 3 Versuche)
      let moved = { ...p }
      let tries = 0
      while (
        tries < 3 &&
        existing.some((e) =>
          overlaps(moved.scheduledStart, moved.scheduledEnd, e.scheduledStart, e.scheduledEnd)
        )
      ) {
        moved = shiftByMinutes(moved, 60)
        tries++
      }
      if (
        !existing.some((e) =>
          overlaps(moved.scheduledStart, moved.scheduledEnd, e.scheduledStart, e.scheduledEnd)
        )
      ) {
        result.push(moved)
      }
    }
  }
  return result
}

/* ===================== Suggestion (client) ====================== */

/** Payload für Vorschläge – passt zum BulkPlanWizard */
export type SuggestPayload = {
  title: string
  sessionMinutes: number
  totalMinutes: number
  window: {
    fromISO: string
    toISO: string
    /** erlaubte Wochentage: 1=Mo … 7=So */
    days: number[]
  }
  /** optional: wie viele Slots pro erlaubtem Tag maximal (default 1) */
  maxPerDay?: number
  /** optionale Pufferzeit zwischen Slots (min) */
  gapMinutes?: number
  /** Startzeit als "HH:MM" – (UI) */
  preferredStart?: string
  /** Fallback: altes Format wird weiterhin toleriert */
  // @deprecated – nur für Backwards-Compat
  preferredStartObj?: { hh: number; mm: number }
}

/** reine Berechnung – erzeugt Vorschlags-Sessions */
export function suggestSlots(input: SuggestPayload): CreateStudySessionDto[] {
  const {
    title,
    sessionMinutes,
    totalMinutes,
    window: { fromISO, toISO, days },
    maxPerDay = 1,
    gapMinutes = 10,
  } = input

  let remaining = Math.max(0, totalMinutes)
  if (remaining === 0 || sessionMinutes <= 0) return []

  const start = new Date(fromISO)
  const end = new Date(toISO)

  // Zeitbasis bestimmen (bevorzugt "HH:MM", sonst evtl. Objekt, sonst fromISO)
  const { hh: baseHH, mm: baseMM } = resolvePreferredStart(input, start)

  const result: CreateStudySessionDto[] = []

  for (let d = new Date(start); d <= end && remaining > 0; d.setDate(d.getDate() + 1)) {
    const weekday = ((d.getDay() + 6) % 7) + 1 // 1..7
    if (!days.includes(weekday)) continue

    // starte jeden erlaubten Tag zur Basiszeit
    let slotStart = isoAt(d, baseHH, baseMM)
    let createdToday = 0

    while (createdToday < maxPerDay && remaining >= sessionMinutes) {
      const slotEnd = isoAddMinutes(slotStart, sessionMinutes)
      result.push({ title, scheduledStart: slotStart, scheduledEnd: slotEnd })
      remaining -= sessionMinutes
      createdToday += 1

      // nächster Slot (Lernblöcke hintereinander) – optional
      slotStart = isoAddMinutes(slotEnd, gapMinutes)
    }
  }

  return result
}

/** React Query Hook – kapselt die Berechnung in eine Mutation */
export function useSuggestSlots() {
  return useMutation({
    mutationKey: ['suggest-slots'],
    mutationFn: async (payload: SuggestPayload) => {
      // rein lokal – kann jederzeit durch API-Call ersetzt werden
      return suggestSlots(payload)
    },
  })
}

/* ====================== kleine Helfer ====================== */

function resolvePreferredStart(
  input: SuggestPayload,
  fallbackFrom: Date
): { hh: number; mm: number } {
  // 1) Neues Format "HH:MM"
  if (input.preferredStart && /^\d{2}:\d{2}$/.test(input.preferredStart)) {
    const [hhStr, mmStr] = input.preferredStart.split(':')
    const hh = clampInt(parseInt(hhStr, 10), 0, 23)
    const mm = clampInt(parseInt(mmStr, 10), 0, 59)
    return { hh, mm }
  }
  // 2) Altes Objektformat
  if (input as any && (input as any).preferredStartObj) {
    const { hh, mm } = (input as any).preferredStartObj as { hh: number; mm: number }
    return { hh: clampInt(hh, 0, 23), mm: clampInt(mm, 0, 59) }
  }
  // 3) Fallback: Uhrzeit aus fromISO
  return { hh: fallbackFrom.getHours(), mm: fallbackFrom.getMinutes() }
}

function clampInt(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min
  return Math.max(min, Math.min(max, n))
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const diff = date.valueOf() - firstThursday.valueOf()
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000))
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
function isoAt(d: Date, hh: number, mm: number) {
  const x = new Date(d)
  x.setHours(hh, mm, 0, 0)
  return x.toISOString()
}
function isoAddMinutes(iso: string, minutes: number) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + minutes)
  return d.toISOString()
}
function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const a1 = new Date(aStart).getTime()
  const a2 = new Date(aEnd).getTime()
  const b1 = new Date(bStart).getTime()
  const b2 = new Date(bEnd).getTime()
  return a1 < b2 && b1 < a2
}
function shiftByMinutes(dto: CreateStudySessionDto, mins: number): CreateStudySessionDto {
  const s = new Date(dto.scheduledStart)
  const e = new Date(dto.scheduledEnd)
  s.setMinutes(s.getMinutes() + mins)
  e.setMinutes(e.getMinutes() + mins)
  return { ...dto, scheduledStart: s.toISOString(), scheduledEnd: e.toISOString() }
}