export function normalizeDateRange(from: string, to: string): { from: Date; to: Date } {
  const f = new Date(from)
  const t = new Date(to)
  // make `to` inclusive by adding one day to the end (exclusive upper bound)
  t.setDate(t.getDate() + 1)
  return { from: f, to: t }
}
