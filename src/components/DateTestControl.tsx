import { toDateKey } from '../lib/progression'

interface DateTestControlProps {
  value: string | null
  onChange: (value: string | null) => void
}

export function DateTestControl({ value, onChange }: DateTestControlProps) {
  const year = new Date().getFullYear()

  return (
    <section className="test-date-bar" aria-label="Mode test de date">
      <div>
        <p className="text-sm font-extrabold text-pine">🧪 Mode test — provisoire</p>
        <p className="text-xs text-pine/60">Simule un jour de décembre.</p>
      </div>
      <label className="sr-only" htmlFor="simulated-date">Date simulée</label>
      <input
        id="simulated-date"
        className="date-field"
        type="date"
        min={`${year}-12-01`}
        max={`${year}-12-25`}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
      />
      {value && (
        <button type="button" className="test-reset" onClick={() => onChange(null)}>
          Aujourd’hui ({toDateKey(new Date()).slice(5).replace('-', '/')})
        </button>
      )}
    </section>
  )
}
