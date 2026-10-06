import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DateTestControl } from './DateTestControl'
import { GIFT_CATEGORIES } from '../content/categories'
import { getGiftJournal } from '../lib/anecdoteEngine'
import { getGiftSchedule, startOfLocalDay, toDateKey } from '../lib/progression'
import { normalizeAppData } from '../lib/storage'
import type { AppDataActions, CategoryId, GiftWish } from '../types/domain'

interface ParentDashboardProps {
  appData: AppDataActions
  onLock: () => void
}

export function ParentDashboard({ appData, onLock }: ParentDashboardProps) {
  const [surpriseProfileId, setSurpriseProfileId] = useState(appData.data.profiles[0]?.id ?? '')
  const [surpriseName, setSurpriseName] = useState('')
  const [surpriseCategory, setSurpriseCategory] = useState<CategoryId>('mystere')
  const [revealDate, setRevealDate] = useState('')
  const [selectedGiftId, setSelectedGiftId] = useState(appData.data.gifts[0]?.id ?? '')
  const [notice, setNotice] = useState('')
  const activeSelectedGift = appData.data.gifts.find((gift) => gift.id === selectedGiftId) ?? appData.data.gifts[0]
  const selectedProfile = activeSelectedGift
    ? appData.data.profiles.find((profile) => profile.id === activeSelectedGift.profileId)
    : undefined
  const effectiveNow = appData.data.settings.simulatedDate
    ? new Date(`${appData.data.settings.simulatedDate}T12:00:00`)
    : new Date()

  const upcomingEntries = useMemo(() => {
    if (!activeSelectedGift || !selectedProfile) return []
    const schedule = getGiftSchedule(activeSelectedGift.registeredAt)
    const previewStart = startOfLocalDay(effectiveNow) < schedule.start ? schedule.start : startOfLocalDay(effectiveNow)
    const previewEnd = new Date(previewStart)
    previewEnd.setDate(previewEnd.getDate() + 6)
    return getGiftJournal(activeSelectedGift, selectedProfile, previewEnd)
      .filter((entry) => entry.date >= toDateKey(previewStart))
      .slice(0, 7)
  }, [activeSelectedGift, selectedProfile, effectiveNow])

  const budgets = appData.data.profiles.map((profile) => ({
    profile,
    total: appData.data.gifts
      .filter((gift) => gift.profileId === profile.id)
      .reduce((sum, gift) => sum + (gift.shopping.price ?? 0), 0),
  }))

  function addSurprise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!surpriseProfileId || !surpriseName.trim() || !revealDate) return
    const gift = appData.addGift({
      profileId: surpriseProfileId,
      name: surpriseName,
      categoryId: surpriseCategory,
      surpriseRevealDate: revealDate,
    })
    setSelectedGiftId(gift.id)
    setSurpriseName('')
    setNotice('Le cadeau surprise est prêt dans les coulisses.')
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(appData.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `atelier-noel-sauvegarde-${toDateKey(new Date())}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setNotice('Sauvegarde JSON téléchargée.')
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const normalized = normalizeAppData(JSON.parse(await file.text()))
      if (!normalized) throw new Error('invalid')
      appData.importData(normalized)
      setNotice('Sauvegarde importée avec succès.')
    } catch {
      setNotice('Ce fichier ne semble pas être une sauvegarde valide.')
    }
    event.target.value = ''
  }

  return (
    <main className="min-h-dvh bg-[#edf3ef] pb-16">
      <header className="parent-header">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-8">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gold">Coulisses de l’atelier</p>
            <h1 className="font-display text-2xl font-bold text-cream">Mode parent</h1>
          </div>
          <Link className="header-button" to="/">Enfants</Link>
          <button className="header-button" type="button" onClick={onLock}>Verrouiller</button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-8">
        {notice && <p className="mb-5 rounded-2xl bg-pine p-4 font-bold text-cream" role="status">{notice}</p>}

        <nav className="parent-nav" aria-label="Sections du mode parent">
          <a href="#profils">Profils</a><a href="#achats">Achats</a><a href="#anecdotes">Anecdotes</a><a href="#reglages">Réglages</a>
        </nav>

        <section className="parent-summary">
          <article><strong>{appData.data.profiles.length}</strong><span>enfant(s)</span></article>
          <article><strong>{appData.data.gifts.length}</strong><span>souhait(s)</span></article>
          <article><strong>{appData.data.goodDeeds.length}</strong><span>bonne(s) action(s)</span></article>
        </section>

        <section id="profils" className="parent-section">
          <p className="eyebrow text-red">Famille</p>
          <h2 className="parent-title">Profils et cadeaux</h2>
          <div className="mt-5 grid gap-5">
            {appData.data.profiles.map((profile) => {
              const gifts = appData.data.gifts.filter((gift) => gift.profileId === profile.id)
              return (
                <article key={profile.id} className="parent-card">
                  <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
                    <label className="field-label">Prénom<input className="text-field" defaultValue={profile.firstName} onBlur={(event) => appData.updateProfile(profile.id, { firstName: event.target.value.trim() || profile.firstName })} /></label>
                    <label className="field-label">Âge<input className="text-field" type="number" min="1" max="17" defaultValue={profile.age} onBlur={(event) => appData.updateProfile(profile.id, { age: Number(event.target.value) || profile.age })} /></label>
                    <button className="danger-button" type="button" onClick={() => window.confirm(`Supprimer le profil de ${profile.firstName} et ses cadeaux ?`) && appData.deleteProfile(profile.id)}>Supprimer</button>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {gifts.length === 0 && <p className="text-ink/55">Aucun cadeau pour ce profil.</p>}
                    {gifts.map((gift) => (
                      <ParentGiftRow key={gift.id} gift={gift} onUpdate={(changes) => appData.updateGift(gift.id, changes)} onDelete={() => window.confirm(`Supprimer “${gift.name}” ?`) && appData.deleteGift(gift.id)} />
                    ))}
                  </div>
                </article>
              )
            })}
          </div>

          <form className="parent-card mt-5" onSubmit={addSurprise}>
            <h3 className="font-display text-2xl font-bold text-pine">Ajouter une surprise invisible</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="field-label">Enfant<select className="text-field" value={surpriseProfileId} onChange={(event) => setSurpriseProfileId(event.target.value)} required>{appData.data.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.firstName}</option>)}</select></label>
              <label className="field-label">Cadeau<input className="text-field" value={surpriseName} onChange={(event) => setSurpriseName(event.target.value)} required /></label>
              <label className="field-label">Catégorie<select className="text-field" value={surpriseCategory} onChange={(event) => setSurpriseCategory(event.target.value as CategoryId)}>{GIFT_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label>
              <label className="field-label">Visible le<input className="text-field" type="date" value={revealDate} onChange={(event) => setRevealDate(event.target.value)} required /></label>
            </div>
            <button className="primary-button mt-4" type="submit">Ajouter la surprise</button>
          </form>
        </section>

        <section id="achats" className="parent-section">
          <p className="eyebrow text-red">En coulisses</p>
          <h2 className="parent-title">Budget par enfant</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map(({ profile, total }) => <article key={profile.id} className="budget-card"><span>{profile.firstName}</span><strong>{total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong></article>)}
          </div>
        </section>

        <section id="anecdotes" className="parent-section">
          <p className="eyebrow text-red">Aperçu</p>
          <h2 className="parent-title">Les 7 prochaines nouvelles</h2>
          {appData.data.gifts.length > 0 ? (
            <>
              <label className="field-label mt-5 max-w-xl">Cadeau<select className="text-field" value={activeSelectedGift?.id ?? ''} onChange={(event) => setSelectedGiftId(event.target.value)}>{appData.data.gifts.map((gift) => <option key={gift.id} value={gift.id}>{appData.data.profiles.find((profile) => profile.id === gift.profileId)?.firstName} — {gift.name}</option>)}</select></label>
              <div className="mt-4 grid gap-3">
                {upcomingEntries.map((entry) => {
                  const key = `${activeSelectedGift!.id}|${entry.date}`
                  return <label key={entry.date} className="anecdote-editor"><span>{new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${entry.date}T12:00:00`))}</span><textarea defaultValue={appData.data.anecdoteOverrides[key] ?? entry.text} onBlur={(event) => appData.setAnecdoteOverride(activeSelectedGift!.id, entry.date, event.target.value === entry.text ? '' : event.target.value)} rows={2} /></label>
                })}
                {upcomingEntries.length === 0 && <p className="text-ink/55">Choisis une date de décembre dans les réglages pour voir les prochaines anecdotes.</p>}
              </div>
            </>
          ) : <p className="mt-4 text-ink/55">Ajoute d’abord un cadeau.</p>}
        </section>

        <section id="reglages" className="parent-section">
          <p className="eyebrow text-red">Configuration</p>
          <h2 className="parent-title">Réglages de Noël</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="parent-card">
              <DateTestControl value={appData.data.settings.simulatedDate} onChange={appData.setSimulatedDate} />
              <label className="field-label">Heure estimée de passage<input className="text-field" type="time" value={appData.data.settings.santaVisitTime} onChange={(event) => appData.setSantaVisitTime(event.target.value)} /></label>
              <label className="mt-4 flex min-h-12 items-center gap-3 font-bold text-pine"><input type="checkbox" checked={appData.data.settings.soundEnabled} onChange={(event) => appData.setSoundEnabled(event.target.checked)} /> Sons du gentillomètre</label>
            </div>
            <div className="parent-card">
              <h3 className="font-display text-2xl font-bold text-pine">Sauvegarde</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="secondary-button" type="button" onClick={exportData}>Exporter en JSON</button>
                <label className="secondary-button cursor-pointer">Importer un JSON<input className="sr-only" type="file" accept="application/json,.json" onChange={importData} /></label>
                <button className="danger-button" type="button" onClick={() => window.confirm('Effacer toutes les données de l’atelier ?') && appData.resetData()}>Tout réinitialiser</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function ParentGiftRow({ gift, onUpdate, onDelete }: { gift: GiftWish; onUpdate: (changes: Partial<GiftWish>) => void; onDelete: () => void }) {
  return (
    <div className="parent-gift-row">
      <div className="min-w-0"><label className="sr-only" htmlFor={`gift-name-${gift.id}`}>Nom du cadeau</label><input id={`gift-name-${gift.id}`} className="parent-gift-name" defaultValue={gift.name} onBlur={(event) => onUpdate({ name: event.target.value.trim() || gift.name })} /><p className="text-xs text-ink/50">{gift.orderNumber}</p></div>
      <select aria-label={`Catégorie de ${gift.name}`} value={gift.categoryId} onChange={(event) => onUpdate({ categoryId: event.target.value as CategoryId })}>{GIFT_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.emoji} {item.shortLabel}</option>)}</select>
      <select aria-label={`Statut de ${gift.name}`} value={gift.status} onChange={(event) => onUpdate({ status: event.target.value as GiftWish['status'] })}><option value="active">En fabrication</option><option value="considering">En réflexion</option></select>
      <label><input type="checkbox" checked={gift.shopping.found} onChange={(event) => onUpdate({ shopping: { ...gift.shopping, found: event.target.checked } })} /> Trouvé</label>
      <label><input type="checkbox" checked={gift.shopping.bought} onChange={(event) => onUpdate({ shopping: { ...gift.shopping, bought: event.target.checked } })} /> Acheté</label>
      <label><input type="checkbox" checked={gift.shopping.hidden} onChange={(event) => onUpdate({ shopping: { ...gift.shopping, hidden: event.target.checked } })} /> Caché</label>
      <label className="price-input"><span>€</span><input aria-label={`Prix de ${gift.name}`} type="number" min="0" step="0.01" value={gift.shopping.price ?? ''} onChange={(event) => onUpdate({ shopping: { ...gift.shopping, price: event.target.value ? Number(event.target.value) : null } })} /></label>
      {gift.surpriseRevealDate && <input aria-label="Date de révélation" type="date" value={gift.surpriseRevealDate} onChange={(event) => onUpdate({ surpriseRevealDate: event.target.value || null })} />}
      <button className="mini-danger" type="button" onClick={onDelete} aria-label={`Supprimer ${gift.name}`}>×</button>
    </div>
  )
}
