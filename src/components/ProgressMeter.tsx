interface ProgressMeterProps {
  percent: number
  label: string
}

export function ProgressMeter({ percent, label }: ProgressMeterProps) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="text-sm font-bold text-pine/70">{label}</p>
        <p className="font-display text-2xl font-bold text-red">{percent} %</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-pine/10" role="progressbar" aria-label="Progression de la fabrication" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-red transition-[width] duration-700" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
