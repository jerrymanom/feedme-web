const longDate = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' })
const monthName = new Intl.DateTimeFormat('es-MX', { month: 'long' })

export function monthKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

export function monthLabel(date = new Date()) {
  return monthName.format(date)
}

// "2026-10-18" is a calendar date, not an instant: build it in local time.
export function formatIsoDate(iso) {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  return longDate.format(new Date(year, month - 1, day))
}
