import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import type { AppDataActions, GoodDeed } from '../types/domain'

const VERDICTS = [
  { id: 'or', emoji: '💛', title: 'Cœur en or', detail: 'Ta gentillesse réchauffe tout l’atelier !' },
  { id: 'etoile', emoji: '⭐', title: 'Étoile de gentillesse', detail: 'Les lutins ont aperçu de très beaux gestes.' },
  { id: 'super', emoji: '🌟', title: 'Super copain', detail: 'Tu sais apporter du sourire autour de toi.' },
  { id: 'encore', emoji: '🌱', title: 'De beaux efforts', detail: 'Chaque petit geste gentil compte beaucoup.' },
] as const

export function KindnessMeter({ appData }: { appData: AppDataActions }) {
  const { profileId } = useParams()
  const profile = appData.data.profiles.find((candidate) => candidate.id === profileId)
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'result'>('idle')
  const [progress, setProgress] = useState(0)
  const [verdictId, setVerdictId] = useState<string>('or')
  const [showSecret, setShowSecret] = useState(false)
  const [deed, setDeed] = useState<GoodDeed | null>(null)
  const secretTimer = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'scanning') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const step = reduced ? 25 : 4
    const delay = reduced ? 80 : 110
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(100, current + step)
        if (appData.data.settings.soundEnabled && (next === 40 || next === 80)) playBeep(420 + next * 2)
        if (next >= 100) {
          window.clearInterval(timer)
          const preset = appData.data.settings.gentillometerPreset
          const chosen = preset && VERDICTS.some((verdict) => verdict.id === preset)
            ? preset
            : VERDICTS[Math.floor(Math.random() * VERDICTS.length)].id
          setVerdictId(chosen)
          appData.setGentillometerPreset(null)
          window.setTimeout(() => setPhase('result'), reduced ? 100 : 350)
          if (appData.data.settings.soundEnabled) playBeep(760)
        }
        return next
      })
    }, delay)
    return () => window.clearInterval(timer)
  }, [phase])

  if (!profile) return <Navigate to="/" replace />
  const verdict = VERDICTS.find((candidate) => candidate.id === verdictId) ?? VERDICTS[0]

  function startSecretGesture() {
    secretTimer.current = window.setTimeout(() => setShowSecret(true), 1200)
  }

  function cancelSecretGesture() {
    if (secretTimer.current) window.clearTimeout(secretTimer.current)
    secretTimer.current = null
  }

  function startScan() {
    setDeed(null)
    setProgress(0)
    setPhase('scanning')
  }

  return (
    <main className="kindness-screen">
      <button className="secret-scan-corner" type="button" aria-label="Coin décoratif" onPointerDown={startSecretGesture} onPointerUp={cancelSecretGesture} onPointerLeave={cancelSecretGesture}>✦</button>
      <Link className="scan-back" to={`/profil/${profile.id}`}>‹ Retour</Link>

      {showSecret && (
        <section className="secret-verdict-panel">
          <div className="flex items-center justify-between gap-3"><strong>Choix secret du parent</strong><button type="button" onClick={() => setShowSecret(false)}>×</button></div>
          <div className="mt-3 grid gap-2">
            {VERDICTS.map((item) => <button key={item.id} type="button" data-selected={appData.data.settings.gentillometerPreset === item.id} onClick={() => { appData.setGentillometerPreset(item.id); setShowSecret(false) }}>{item.emoji} {item.title}</button>)}
          </div>
        </section>
      )}

      <div className="scan-stage">
        {phase === 'idle' && (
          <section className="text-center">
            <p className="eyebrow text-gold">Gentillomètre</p>
            <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl">Prêt, {profile.firstName} ?</h1>
            <div className="scan-frame mx-auto mt-8"><span aria-hidden="true">😊</span><div className="scan-line" /></div>
            <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-cream/75">Cadre le visage, tiens le téléphone bien droit et lance le scanner magique.</p>
            <button className="scan-button mt-7" type="button" onClick={startScan}>Lancer le scan</button>
          </section>
        )}

        {phase === 'scanning' && (
          <section className="w-full max-w-lg text-center" aria-live="polite">
            <p className="eyebrow text-gold">Analyse de la gentillesse…</p>
            <div className="scan-frame active mx-auto mt-6"><span aria-hidden="true">🙂</span><div className="scan-line" /></div>
            <div className="mx-auto mt-8 h-5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${progress}%` }} /></div>
            <p className="mt-3 font-display text-3xl font-bold text-cream">{progress} %</p>
          </section>
        )}

        {phase === 'result' && (
          <section className="result-card" aria-live="polite">
            <span className="text-7xl" aria-hidden="true">{verdict.emoji}</span>
            <p className="eyebrow mt-5 text-red">Verdict du scanner</p>
            <h1 className="font-display text-4xl font-bold text-pine sm:text-5xl">{verdict.title}</h1>
            <p className="mt-3 text-lg leading-relaxed text-ink/70">{verdict.detail}</p>
            {deed ? (
              <div className="mt-6 rounded-2xl bg-gold/15 p-4"><p className="text-3xl" aria-hidden="true">{deed.reward === 'snowflake' ? '❄️' : '⭐'}</p><p className="mt-2 font-bold text-pine">{deed.message}</p></div>
            ) : (
              <button className="primary-button mt-6 w-full" type="button" onClick={() => setDeed(appData.recordGoodDeed(profile.id))}>J’ai fait une bonne action</button>
            )}
            <button className="secondary-button mt-3 w-full" type="button" onClick={startScan}>Recommencer</button>
          </section>
        )}
      </div>
    </main>
  )
}

function playBeep(frequency: number) {
  try {
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.05, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.12)
  } catch {
    // Le son reste optionnel si le navigateur le bloque.
  }
}
