// Minus / value / plus control. The value is announced, the buttons say what they do.
export default function Stepper({ value, onChange, min = 0, label, disabled = false }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={disabled || value <= min}
        aria-label={`Quitar uno de ${label}`}>−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={disabled}
        aria-label={`Agregar uno a ${label}`}>+</button>
    </div>
  )
}
