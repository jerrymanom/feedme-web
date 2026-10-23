export const MEALTIMES = {
  desayuno: { key: 'desayuno', label: 'desayuno', greeting: 'Buenos días' },
  comida: { key: 'comida', label: 'comida', greeting: 'Buenas tardes' },
  cena: { key: 'cena', label: 'cena', greeting: 'Buenas noches' },
}

// Late at night the app plans tomorrow's breakfast instead of showing nothing.
export function mealtimeFor(date = new Date()) {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return { ...MEALTIMES.desayuno, tomorrow: false }
  if (hour >= 12 && hour < 18) return { ...MEALTIMES.comida, tomorrow: false }
  if (hour >= 18) return { ...MEALTIMES.cena, tomorrow: false }
  return { ...MEALTIMES.desayuno, greeting: 'Para mañana', tomorrow: true }
}
