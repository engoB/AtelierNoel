import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { getCategory } from '../content/categories'
import { isGiftVisibleToChild } from '../lib/visibility'
import type { AppDataActions } from '../types/domain'
import magicSleigh from '../assets/magic-sleigh.webp'

const CITIES = ['Rovaniemi', 'Stockholm', 'Berlin', 'Milan', 'Lyon', 'Ta maison']

export function ChristmasEve({ appData }: { appData: AppDataActions }) {
  const { profileId } = useParams()
  const profile = appData.data.profiles.find((candidate) => candidate.id === profileId)
  const simulated = appData.data.settings.simulatedDate
  const [clock, setClock] = useState(() => simulated ? new Date(`${simulated}T12:00:00`) : new Date())
  const [loadingStarted, setLoadingStarted] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    if (simulated) {
      setClock(new Date(`${simulated}T12:00:00`))
      return
    }
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [simulated])

  const gifts = useMemo(() => appData.data.gifts.filter((gift) => gift.profileId === profileId && gift.status === 'active' && isGiftVisibleToChild(gift, clock)), [appData.data.gifts, profileId, clock])

  useEffect(() => {
    if (!loadingStarted || loadedCount >= gifts.length) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setLoadedCount((count) => count + 1), reduced ? 120 : 750)
    return () => window.clearTimeout(timer)
  }, [loadingStarted, loadedCount, gifts.length])

  if (!profile) return <Navigate to="/" replace />
  const [hours, minutes] = appData.data.settings.santaVisitTime.split(':').map(Number)
  const visitTime = new Date(clock.getFullYear(), 11, 24, hours || 23, minutes || 0)
  const remainingMs = Math.max(0, visitTime.getTime() - clock.getTime())
  const hasArrived = clock >= visitTime || (clock.getMonth() === 11 && clock.getDate() > 24)
  const routeStart = new Date(clock.getFullYear(), 11, 24, 18, 0)
  const routeProgress = Math.max(0, Math.min(1, (clock.getTime() - routeStart.getTime()) / Math.max(1, visitTime.getTime() - routeStart.getTime())))
  const cityIndex = Math.min(CITIES.length - 1, Math.floor(routeProgress * CITIES.length))
  const loadedAll = loadedCount >= gifts.length

  if (hasArrived) {
    return (
      <main className="night-screen">
        <section className="sleep-card">
          <span className="text-7xl" aria-hidden="true">🌙</span>
          <p className="eyebrow mt-5 text-gold">Le traîneau approche</p>
          <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl">Vite au lit, {profile.firstName} !</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-cream/75">Le Père Noël ne peut passer que lorsque les petits yeux sont bien fermés.</p>
          <Link className="scan-button mt-7" to={`/profil/${profile.id}`}>Retour à mon atelier</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="christmas-eve-screen">
      <header className="eve-header"><Link className="header-button" to={`/profil/${profile.id}`}>‹ Atelier</Link><div><p>24 décembre</p><h1>Le grand départ</h1></div></header>

      {!loadedAll ? (
        <section className="loading-sleigh">
          <p className="eyebrow text-red">Préparation du traîneau</p>
          <h2 className="font-display text-4xl font-bold text-pine">Tous les souhaits montent à bord</h2>
          <div className="sleigh-bay" aria-live="polite">
            <img className="sleigh-art" src={magicSleigh} alt="Le traîneau magique et ses deux rennes, chargé de cadeaux" />
            <div className="grid gap-3">
              {gifts.map((gift, index) => {
                const category = getCategory(gift.categoryId)
                return <div key={gift.id} className="loading-gift" data-loaded={index < loadedCount}><span>{category.emoji}</span><strong>{index < loadedCount ? `${gift.name} est chargé !` : gift.name}</strong></div>
              })}
              {gifts.length === 0 && <p>Aucun cadeau à charger pour le moment.</p>}
            </div>
          </div>
          {!loadingStarted && <button className="primary-button mt-6" type="button" onClick={() => setLoadingStarted(true)}>Commencer le chargement</button>}
          {loadingStarted && <p className="mt-5 font-bold text-pine">{Math.min(loadedCount, gifts.length)} sur {gifts.length} chargé(s)</p>}
          {gifts.length === 0 && <button className="primary-button mt-6" type="button" onClick={() => setLoadedCount(0)}>Le traîneau est prêt</button>}
        </section>
      ) : (
        <section className="tracker-section">
          <div className="tracker-heading">
            <div><p className="eyebrow text-gold">En route</p><h2 className="font-display text-4xl font-bold text-cream">Le traîneau survole {CITIES[cityIndex]}</h2></div>
            <div className="countdown"><span>Passage estimé dans</span><strong>{formatCountdown(remainingMs)}</strong></div>
          </div>
          <svg className="route-map" viewBox="0 0 800 430" role="img" aria-label={`Carte du trajet, le traîneau approche de ${CITIES[cityIndex]}`}>
            <rect width="800" height="430" rx="32" fill="#163a30" />
            <path d="M70 80 C180 20 250 150 350 120 S500 210 590 165 S690 250 745 335" fill="none" stroke="#e8bc5a" strokeWidth="8" strokeLinecap="round" strokeDasharray="14 18" />
            {[[70,80],[215,88],[350,120],[490,177],[615,190],[745,335]].map(([x,y], index) => <g key={CITIES[index]}><circle cx={x} cy={y} r="10" fill={index <= cityIndex ? '#e8bc5a' : '#fff8e8'} /><text x={x} y={y + 30} textAnchor="middle" fill="#fff8e8" fontSize="16" fontWeight="700">{CITIES[index]}</text></g>)}
            <text x={70 + (745 - 70) * routeProgress} y={65 + (335 - 65) * routeProgress} fontSize="42" textAnchor="middle">🛷</text>
            <circle cx="655" cy="310" r="34" fill="#8f1d26" /><text x="655" y="320" textAnchor="middle" fontSize="30">🏠</text>
          </svg>
          <p className="tracker-message">✨ Les rennes gardent un rythme parfait. Prochaine étape : {CITIES[Math.min(CITIES.length - 1, cityIndex + 1)]}.</p>
        </section>
      )}
    </main>
  )
}

function formatCountdown(milliseconds: number): string {
  const totalMinutes = Math.ceil(milliseconds / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')} h ${String(minutes).padStart(2, '0')}`
}
