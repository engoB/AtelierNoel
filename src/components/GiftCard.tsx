import { getCategory } from '../content/categories'
import { getElf } from '../content/elves'
import { getProgressSnapshot } from '../lib/progression'
import type { GiftWish } from '../types/domain'
import { Link } from 'react-router-dom'
import { ProgressMeter } from './ProgressMeter'

interface GiftCardProps {
  gift: GiftWish
  profileId: string
  now: Date
}

export function GiftCard({ gift, profileId, now }: GiftCardProps) {
  const category = getCategory(gift.categoryId)
  const elf = getElf(gift.elfId)
  const registeredDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(gift.registeredAt))
  const progress = getProgressSnapshot(gift, now)

  return (
    <article className="gift-card">
      {gift.decoration && <span className="gift-decoration" aria-label={gift.decoration === 'star' ? 'Décoration étoile gagnée' : 'Décoration flocon gagnée'}>{gift.decoration === 'star' ? '⭐' : '❄️'}</span>}
      <div className="gift-card-shine" aria-hidden="true" />
      <div className="flex items-start gap-4">
        <span className="gift-category-icon" style={{ backgroundColor: `${category.color}18`, boxShadow: `inset 0 0 0 1px ${category.color}22` }} aria-hidden="true">
          {category.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold uppercase tracking-wide" style={{ color: category.color }}>{category.shortLabel}</p>
          <h2 className="mt-1 break-words font-display text-2xl font-bold text-pine">{gift.name}</h2>
        </div>
        <span className="gift-progress-badge">{progress.percent}<small>%</small></span>
      </div>

      <div className="ticket mt-5">
        <div>
          <p className="ticket-label">Bon de fabrication</p>
          <p className="font-mono text-sm font-bold text-pine">{gift.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="ticket-label">Enregistré le</p>
          <p className="text-sm font-bold text-pine">{registeredDate}</p>
        </div>
      </div>

      <div className="elf-note mt-4">
        <span className="elf-portrait" role="img" aria-label="Portrait du lutin">{elf.emoji}</span>
        <p className="text-sm leading-snug text-ink/70">
          <span className="block text-xs font-black uppercase tracking-widest text-red/70">Lutin attitré</span>
          <strong className="text-pine">{elf.name}</strong>, {elf.trait}, veille sur ce souhait.
        </p>
      </div>

      <div className="mt-5 border-t border-pine/10 pt-5">
        <ProgressMeter percent={progress.percent} label={progress.currentStep} />
        {gift.status === 'considering' && <p className="mt-3 rounded-xl bg-gold/15 p-3 text-sm font-bold text-pine">Le Père Noël étudie la question avec beaucoup d’attention.</p>}
        {progress.isLate && !progress.isComplete && (
          <p className="mt-3 text-sm font-bold text-red">⚡ Les lutins font des heures supplémentaires !</p>
        )}
        <Link className="journal-link mt-4" to={`/profil/${profileId}/cadeau/${gift.id}`}>Ouvrir le carnet de bord <span aria-hidden="true">›</span></Link>
      </div>
    </article>
  )
}
