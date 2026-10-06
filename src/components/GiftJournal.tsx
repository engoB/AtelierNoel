import { Link, Navigate, useParams } from 'react-router-dom'

import { ProgressMeter } from './ProgressMeter'
import { getCategory } from '../content/categories'
import { getElf } from '../content/elves'
import { getGiftJournal } from '../lib/anecdoteEngine'
import { getProgressSnapshot } from '../lib/progression'
import type { AppDataActions } from '../types/domain'
import { isGiftVisibleToChild } from '../lib/visibility'

interface GiftJournalProps {
  appData: AppDataActions
}

export function GiftJournal({ appData }: GiftJournalProps) {
  const { profileId, giftId } = useParams()
  const profile = appData.data.profiles.find((candidate) => candidate.id === profileId)
  const gift = appData.data.gifts.find((candidate) => candidate.id === giftId && candidate.profileId === profileId)

  if (!profile || !gift) return <Navigate to="/" replace />

  const now = appData.data.settings.simulatedDate
    ? new Date(`${appData.data.settings.simulatedDate}T12:00:00`)
    : new Date()
  if (!isGiftVisibleToChild(gift, now)) return <Navigate to={`/profil/${profile.id}`} replace />
  const category = getCategory(gift.categoryId)
  const elf = getElf(gift.elfId)
  const progress = getProgressSnapshot(gift, now)
  const goodDeeds = appData.data.goodDeeds.filter((deed) => deed.profileId === profile.id)
  const journal = getGiftJournal(gift, profile, now).map((entry) => ({
    ...entry,
    text: appData.data.anecdoteOverrides[`${gift.id}|${entry.date}`] ?? entry.text,
  }))
  const latestEntry = journal.at(-1)
  const dateFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <main className="min-h-dvh bg-cream pb-16">
      <header className="workshop-header">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4 sm:px-8">
          <Link className="header-button" to={`/profil/${profile.id}`} aria-label="Retour à la liste">‹ Retour</Link>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-sm font-bold text-gold">Carnet de bord</p>
            <h1 className="truncate font-display text-2xl font-bold text-cream">{gift.name}</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8 sm:py-10">
        <section className="journal-hero">
          <div className="flex items-start gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl text-4xl" style={{ backgroundColor: `${category.color}18` }} aria-hidden="true">{category.emoji}</span>
            <div>
              <p className="eyebrow" style={{ color: category.color }}>{category.label}</p>
              <h2 className="font-display text-3xl font-bold text-pine sm:text-4xl">{gift.name}</h2>
              <p className="mt-2 text-base text-ink/65">{elf.emoji} Suivi par <strong>{elf.name}</strong>, {elf.trait}.</p>
            </div>
          </div>
          <div className="mt-7">
            <ProgressMeter percent={progress.percent} label={progress.currentStep} />
          </div>
          {goodDeeds.length > 0 && <p className="mt-5 rounded-2xl bg-gold/15 p-4 font-bold text-pine">⭐ {goodDeeds.length} bonne{goodDeeds.length > 1 ? 's' : ''} action{goodDeeds.length > 1 ? 's' : ''} brille{goodDeeds.length > 1 ? 'nt' : ''} dans ce carnet.</p>}
        </section>

        <section className="mt-6 rounded-3xl bg-pine p-5 text-cream shadow-xl shadow-pine/15 sm:p-7">
          <p className="eyebrow text-gold">La nouvelle du jour</p>
          {latestEntry ? (
            <>
              <p className="font-display text-2xl font-bold leading-snug">{latestEntry.text}</p>
              <p className="mt-3 text-sm font-semibold capitalize text-cream/65">{dateFormatter.format(new Date(`${latestEntry.date}T12:00:00`))}</p>
            </>
          ) : (
            <p className="text-lg leading-relaxed text-cream/80">Le carnet s’ouvrira le jour où la fabrication commencera.</p>
          )}
        </section>

        <section className="mt-8">
          <p className="eyebrow text-red">Fabrication</p>
          <h2 className="font-display text-3xl font-bold text-pine">Les étapes de l’atelier</h2>
          <ol className="mt-5 grid gap-3">
            {category.steps.map((step, index) => {
              const isDone = progress.isComplete || index < progress.currentStepIndex
              const isCurrent = progress.isStarted && !progress.isComplete && index === progress.currentStepIndex
              return (
                <li key={step} className="step-row" data-state={isDone ? 'done' : isCurrent ? 'current' : 'waiting'}>
                  <span className="step-marker" aria-hidden="true">{isDone ? '✓' : index + 1}</span>
                  <span className="font-bold text-pine">{step}</span>
                  <span className="ml-auto text-sm font-bold text-pine/50">{isDone ? 'Terminé' : isCurrent ? 'En cours' : 'À venir'}</span>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="mt-9">
          <p className="eyebrow text-red">Souvenirs</p>
          <h2 className="font-display text-3xl font-bold text-pine">Toutes les nouvelles</h2>
          {journal.length > 0 ? (
            <ol className="journal-timeline mt-5">
              {[...journal].reverse().map((entry) => (
                <li key={entry.date} className="journal-entry">
                  <time className="text-sm font-extrabold capitalize text-red" dateTime={entry.date}>
                    {dateFormatter.format(new Date(`${entry.date}T12:00:00`))}
                  </time>
                  <p className="mt-1 text-base leading-relaxed text-ink/75">{entry.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 rounded-2xl bg-white p-5 text-ink/65">Aucune nouvelle pour le moment. Essaie une date de décembre avec le mode test.</p>
          )}
        </section>
      </div>
    </main>
  )
}
