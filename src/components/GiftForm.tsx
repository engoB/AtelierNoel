import { FormEvent, useEffect, useMemo, useState } from 'react'

import { GIFT_CATEGORIES, getCategory } from '../content/categories'
import { detectCategory, detectCategoryMatches } from '../lib/categoryDetection'
import type { CategoryId } from '../types/domain'

interface GiftFormProps {
  firstName: string
  onAdd: (input: { name: string; categoryId: CategoryId }) => void
  onClose: () => void
}

export function GiftForm({ firstName, onAdd, onClose }: GiftFormProps) {
  const [name, setName] = useState('')
  const detectedCategoryId = useMemo(() => detectCategory(name), [name])
  const [categoryId, setCategoryId] = useState<CategoryId>('mystere')
  const [step, setStep] = useState<1 | 2>(1)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => setCategoryId(detectedCategoryId), [detectedCategoryId])
  const detectedCategory = getCategory(detectedCategoryId)
  const matches = useMemo(() => detectCategoryMatches(name), [name])
  const suggestedIds = new Set<CategoryId>([detectedCategoryId, ...matches.slice(1, 3).map((match) => match.categoryId)])
  const suggestedCategories = GIFT_CATEGORIES.filter((category) => suggestedIds.has(category.id))
  const fallbackCategories = GIFT_CATEGORIES.filter((category) => ['peluche', 'jeu-societe', 'construction', 'mystere'].includes(category.id) && !suggestedIds.has(category.id))
  const visibleCategories = showAll ? GIFT_CATEGORIES : [...suggestedCategories, ...fallbackCategories].slice(0, 3)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    if (step === 1) {
      setStep(2)
      return
    }
    onAdd({ name, categoryId })
  }

  return (
    <form className="wish-quest" onSubmit={handleSubmit}>
      <div className="quest-steps" aria-label={`Étape ${step} sur 2`}><i data-active="true" /><i data-active={step === 2} /></div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-red">Quête · Confier un souhait</p>
          <h2 className="font-display text-2xl font-bold text-pine">{step === 1 ? `Quel rêve veux-tu confier, ${firstName} ?` : 'Les lutins ont une intuition…'}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer le formulaire">×</button>
      </div>

      {step === 1 ? (
        <>
          <label className="field-label mt-6">Ton souhait<input className="wish-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Écris avec tes mots…" maxLength={80} autoFocus required /></label>
          <div className="wish-ideas" aria-label="Idées de souhaits">
            {['Une peluche renard', 'Un vélo', 'Un jeu de société', 'Un coffret de dessin'].map((idea) => <button key={idea} type="button" onClick={() => setName(idea)}>{idea}</button>)}
          </div>
          <button className="primary-button mt-7 w-full" type="submit" disabled={!name.trim()}>Faire passer mon souhait dans le portail <span aria-hidden="true">→</span></button>
        </>
      ) : (
        <>
          <div className="wish-recognition" aria-live="polite"><span>{detectedCategory.emoji}</span><div><small>Notre meilleure intuition</small><strong>{detectedCategory.label}</strong><p>{matches[0]?.confidence === 'forte' ? 'Les lutins semblent presque certains.' : 'Un petit coup de pouce nous aidera.'}</p></div></div>
          <fieldset className="mt-5">
            <legend className="field-label mb-3">À quelle famille ressemble le plus « {name} » ?</legend>
            <div className="category-choice-grid">
              {visibleCategories.map((category) => <label key={category.id} className="category-choice" data-selected={categoryId === category.id}><input className="sr-only" type="radio" name="category" checked={categoryId === category.id} onChange={() => setCategoryId(category.id)} /><span>{category.emoji}</span><strong>{category.shortLabel}</strong><small>{category.steps[0]}</small></label>)}
            </div>
          </fieldset>
          {!showAll && <button className="show-categories" type="button" onClick={() => setShowAll(true)}>Voir toutes les familles de cadeaux</button>}
          <div className="mt-6 flex gap-3"><button className="secondary-button" type="button" onClick={() => setStep(1)}>← Modifier</button><button className="primary-button flex-1" type="submit">Oui, confier aux lutins ✨</button></div>
        </>
      )}
    </form>
  )
}
