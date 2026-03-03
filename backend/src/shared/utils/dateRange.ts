/**
 * Utilidad para normalizar y validar rangos de fecha recibidos desde query params.
 * - Acepta valores opcionales (unknown) y aplica defaults: `to = ahora`, `from = to - 30d`.
 * - Valida que `from <= to` y aplica un límite máximo configurable (por defecto 11 años).
 * - Devuelve objetos `Date` listos para pasarse al caso de uso / repositorio.
 *
 * Diseño: la validación ligera de tipos debe mantenerse en Zod (esquema),
 * mientras que las decisiones de negocio sobre defaults y límites se hacen aquí.
 */
export function normalizeDateRange(
  from?: unknown,
  to?: unknown,
  opts?: { defaultDays?: number; maxYears?: number }
): { from: Date; to: Date } {
  const defaultDays = opts?.defaultDays ?? 30
  const maxYears = opts?.maxYears ?? 11

  const now = new Date()

  const parse = (v: unknown): Date | null => {
    if (typeof v === 'string') {
      const d = new Date(v)
      return Number.isNaN(d.getTime()) ? null : d
    }
    if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
    return null
  }

  const toDate = parse(to) ?? now
  const fromDate = parse(from) ?? new Date(toDate.getTime() - defaultDays * 24 * 60 * 60 * 1000)

  if (fromDate.getTime() > toDate.getTime()) throw new Error('Invalid date range: from must be <= to')


  // Si el parámetro `to` fue pasado como una fecha "solo día" (YYYY-MM-DD sin hora),
  // convertimos `to` a `to + 1 día` y la intención será `ts >= from AND ts < to_plus_one_day`.
  // Si `to` incluye hora (timestamp), respetamos el valor exacto.
  const isDateOnlyString = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
  let effectiveTo = toDate
  if (isDateOnlyString(to)) {
    effectiveTo = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate() + 1))
  }

  const maxToDate = new Date(fromDate)
  maxToDate.setUTCFullYear(maxToDate.getUTCFullYear() + maxYears)

  if (effectiveTo.getTime() > maxToDate.getTime()) {
    throw new Error(`Range too large (max ${maxYears} years)`)
  }

  return { from: fromDate, to: effectiveTo }
}

export type DateRange = ReturnType<typeof normalizeDateRange>
