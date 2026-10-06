import { FormEvent, useEffect, useMemo, useState } from 'react'

import { GIFT_CATEGORIES, getCategory } from '../content/categories'
import { detectCategory } from '../lib/categoryDetection'
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

  useEffect(() => setCategoryId(detectedCategoryId), [detectedCategoryId])
  const detectedCategory = getCategory(detectedCategoryId)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    onAdd({ name, categoryId })
  }

  return (
    <form className="rounded-[1.75rem] border border-pine/10 bg-white p-5 shadow-xl shadow-pine/10 sm:p-7" onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-red">Lettre de souhaits</p>
          <h2 className="font-display text-2xl font-bold text-pine">Qu’aimerais-tu, {firstName} ?</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer le formulaire">×</button>
      </div>

      <label className="field-label mt-5">
        Ton souhait
        <input className="text-field" value={name} onChange={(event) => setName(event.target.value)} placeholder="Par exemple : une boîte de briques" maxLength={80} autoFocus required />
      </label>

      {name.trim() && (
        <div className="mt-4 rounded-2xl bg-cream p-4" aria-live="polite">
          <p className="text-sm font-bold text-pine/65">Catégorie proposée</p>
          <p className="mt-1 flex items-center gap-2 font-bold text-pine">
            <span className="text-2xl" aria-hidden="true">{detectedCategory.emoji}</span>
            {detectedCategory.label}
          </p>
        </div>
      )}

      <label className="field-label mt-4">
        Confirme ou corrige la catégorie
        <select className="text-field" value={categoryId} onChange={(event) => setCategoryId(event.target.value as CategoryId)}>
          {GIFT_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>{category.emoji} {category.label}</option>
          ))}
        </select>
      </label>

      <button className="primary-button mt-6 w-full" type="submit">Envoyer à l’atelier</button>
    </form>
  )
}
