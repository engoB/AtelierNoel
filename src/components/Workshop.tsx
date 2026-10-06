import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { AvatarBadge } from './AvatarBadge'
import { GiftCard } from './GiftCard'
import { GiftForm } from './GiftForm'
import type { AppDataActions } from '../types/domain'
import { isGiftVisibleToChild } from '../lib/visibility'
import { getProgressSnapshot } from '../lib/progression'
import workshopNight from '../assets/workshop-night.webp'

interface WorkshopProps {
  appData: AppDataActions
}

export function Workshop({ appData }: WorkshopProps) {
  const { profileId } = useParams()
  const [isAddingGift, setIsAddingGift] = useState(false)
  const profile = appData.data.profiles.find((candidate) => candidate.id === profileId)

  if (!profile) return <Navigate to="/" replace />
  const now = appData.data.settings.simulatedDate
    ? new Date(`${appData.data.settings.simulatedDate}T12:00:00`)
    : new Date()
  const gifts = appData.data.gifts.filter((gift) => gift.profileId === profile.id && isGiftVisibleToChild(gift, now))
  const averageProgress = gifts.length
    ? Math.round(gifts.reduce((sum, gift) => sum + getProgressSnapshot(gift, now).percent, 0) / gifts.length)
    : 0
  const dateLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  return (
    <main className="workshop-screen min-h-dvh pb-28">
      <header className="workshop-header">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-4 sm:px-8">
          <AvatarBadge avatarId={profile.avatarId} size="small" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gold">L’atelier de</p>
            <h1 className="truncate font-display text-2xl font-bold text-cream">{profile.firstName}</h1>
          </div>
          <Link className="header-button" to="/" aria-label="Changer de profil">Changer</Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-8 sm:py-10">
        <section className="workshop-welcome" style={{ backgroundImage: `linear-gradient(90deg, rgba(14, 43, 34, .94) 0%, rgba(14, 43, 34, .78) 48%, rgba(14, 43, 34, .12) 100%), url(${workshopNight})` }}>
          <div className="relative z-10 max-w-xl">
            <p className="eyebrow text-gold">{dateLabel}</p>
            <h2 className="font-display text-4xl font-bold leading-tight text-cream sm:text-5xl">Bonjour {profile.firstName},<br />l’atelier s’éveille.</h2>
            <p className="mt-3 max-w-md text-base font-semibold leading-relaxed text-cream/75">Les lutins ont laissé de nouvelles traces dans tes carnets de fabrication.</p>
          </div>
          {gifts.length > 0 && (
            <div className="workshop-overview" aria-label={`Progression moyenne ${averageProgress} pour cent`}>
              <span>Élan de l’atelier</span><strong>{averageProgress}<small>%</small></strong>
              <div><i style={{ width: `${averageProgress}%` }} /></div>
            </div>
          )}
        </section>

        <nav className="child-actions" aria-label="Activités de l’atelier">
          <Link className="magic-action" to={`/profil/${profile.id}/gentillometre`}><span aria-hidden="true">✨</span><span><strong>Gentillomètre</strong><small>Découvrir la magie en toi</small></span><b aria-hidden="true">›</b></Link>
          {now.getMonth() === 11 && now.getDate() === 24 && <Link to={`/profil/${profile.id}/24-decembre`}><span aria-hidden="true">🛷</span><span><strong>Le traîneau</strong><small>Suivre le voyage</small></span></Link>}
          {now.getMonth() === 11 && now.getDate() >= 25 && <Link to={`/profil/${profile.id}/merci`}><span aria-hidden="true">💌</span><span><strong>Dire merci</strong><small>Aux lutins</small></span></Link>}
        </nav>

        <section className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-red">Lettre de souhaits</p>
            <h2 className="font-display text-3xl font-bold text-pine sm:text-4xl">
              {gifts.length === 0 ? 'Ta liste commence ici' : `${gifts.length} souhait${gifts.length > 1 ? 's' : ''} confié${gifts.length > 1 ? 's' : ''}`}
            </h2>
          </div>
          {gifts.length > 0 && (
            <button type="button" className="secondary-button hidden sm:flex" onClick={() => setIsAddingGift(true)}>＋ Nouveau souhait</button>
          )}
        </section>

        {isAddingGift ? (
          <div className="mx-auto max-w-2xl">
            <GiftForm
              firstName={profile.firstName}
              onClose={() => setIsAddingGift(false)}
              onAdd={(input) => {
                appData.addGift({ ...input, profileId: profile.id })
                setIsAddingGift(false)
              }}
            />
          </div>
        ) : gifts.length === 0 ? (
          <section className="empty-state">
            <span className="text-6xl" aria-hidden="true">✉️</span>
            <h3 className="mt-4 font-display text-3xl font-bold text-pine">Un souhait pour Noël ?</h3>
            <p className="mx-auto mt-2 max-w-md text-lg leading-relaxed text-ink/65">Écris-le ici. Les lutins choisiront aussitôt qui va s’en occuper.</p>
            <button type="button" className="primary-button mt-6" onClick={() => setIsAddingGift(true)}>Ajouter mon premier souhait</button>
          </section>
        ) : (
          <div className="gift-grid grid gap-5 md:grid-cols-2">
            {gifts.map((gift) => <GiftCard key={gift.id} gift={gift} profileId={profile.id} now={now} />)}
          </div>
        )}
      </div>

      {!isAddingGift && gifts.length > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-20 flex justify-center px-4 sm:hidden">
          <button type="button" className="primary-button w-full max-w-sm shadow-2xl" onClick={() => setIsAddingGift(true)}>＋ Ajouter un souhait</button>
        </div>
      )}
    </main>
  )
}
