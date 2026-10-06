import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { AvatarBadge } from './AvatarBadge'
import { GiftCard } from './GiftCard'
import { GiftForm } from './GiftForm'
import { getCategory } from '../content/categories'
import { getElf } from '../content/elves'
import { getMagicQuality } from '../content/qualities'
import type { AppDataActions, GiftWish } from '../types/domain'
import { isGiftVisibleToChild } from '../lib/visibility'
import { getProgressSnapshot } from '../lib/progression'
import workshopWorld from '../assets/workshop-world-v3.webp'

interface WorkshopProps {
  appData: AppDataActions
}

export function Workshop({ appData }: WorkshopProps) {
  const { profileId } = useParams()
  const [isAddingGift, setIsAddingGift] = useState(false)
  const [arrivalGift, setArrivalGift] = useState<GiftWish | null>(null)
  const profile = appData.data.profiles.find((candidate) => candidate.id === profileId)

  if (!profile) return <Navigate to="/" replace />
  const now = appData.data.settings.simulatedDate
    ? new Date(`${appData.data.settings.simulatedDate}T12:00:00`)
    : new Date()
  const gifts = appData.data.gifts.filter((gift) => gift.profileId === profile.id && isGiftVisibleToChild(gift, now))
  const deeds = appData.data.goodDeeds.filter((deed) => deed.profileId === profile.id)
  const story = appData.data.storyProgress[profile.id]
  const sparkles = story?.sparklesFound ?? 0
  const xp = gifts.length * 80 + deeds.length * 50 + (story?.messageSeen ? 100 : 0) + sparkles * 5
  const level = Math.floor(xp / 180) + 1
  const levelProgress = xp % 180
  const averageProgress = gifts.length
    ? Math.round(gifts.reduce((sum, gift) => sum + getProgressSnapshot(gift, now).percent, 0) / gifts.length)
    : 0
  const quality = getMagicQuality(profile.magicQuality)
  const isChristmasEve = now.getMonth() === 11 && now.getDate() === 24
  const isChristmasDay = now.getMonth() === 11 && now.getDate() >= 25
  const currentQuest = gifts.length === 0
    ? { eyebrow: 'Quête principale', title: 'Allume le chemin des souhaits', text: 'Confie un premier rêve. Sa lumière guidera un lutin jusqu’à toi.', action: 'Confier un souhait', onClick: () => setIsAddingGift(true), href: undefined }
    : !story?.messageSeen
      ? { eyebrow: 'Une voix t’attend', title: 'Ouvre le grand livre', text: 'Le Père Noël a préparé une page qui connaît déjà ton histoire.', action: 'Recevoir le message', onClick: undefined, href: `/profil/${profile.id}/message` }
      : deeds.length === 0
        ? { eyebrow: 'Mission du jour', title: 'Réveille une étoile', text: 'Le gentillomètre sait reconnaître la magie des petits gestes.', action: 'Lancer le gentillomètre', onClick: undefined, href: `/profil/${profile.id}/gentillometre` }
        : { eyebrow: 'L’atelier avance', title: `${averageProgress}% de magie assemblée`, text: 'Ouvre un carnet pour découvrir ce que les lutins ont préparé aujourd’hui.', action: 'Voir les carnets', onClick: () => scrollToId('souhaits'), href: undefined }

  return (
    <main id="top" className="game-screen min-h-dvh pb-28">
      <header className="game-hud">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
          <AvatarBadge avatarId={profile.avatarId} photoDataUrl={profile.photoDataUrl} size="small" />
          <div className="min-w-0 flex-1"><p className="hud-kicker">{quality.emoji} {quality.label}</p><h1>{profile.firstName}</h1></div>
          <div className="hud-level" aria-label={`Niveau ${level}, ${levelProgress} points sur 180`}><span>Niv. {level}</span><i><b style={{ width: `${Math.round(levelProgress / 1.8)}%` }} /></i></div>
          <div className="hud-stars" aria-label={`${deeds.length + sparkles} étoiles`}><span>✦</span>{deeds.length + sparkles}</div>
          <Link className="hud-profile" to="/" aria-label="Changer de profil">⌄</Link>
        </div>
      </header>

      <section className="world-hero" style={{ backgroundImage: `url(${workshopWorld})` }} aria-labelledby="world-title">
        <div className="world-shade" />
        <div className="world-story"><p className="chapter-label">Chapitre {Math.min(level, 4)} · Le chemin des étoiles</p><h2 id="world-title">Bienvenue dans ton histoire, {profile.firstName}</h2><p>Chaque souhait et chaque geste gentil allume un morceau du chemin jusqu’au traîneau.</p></div>

        <WorldDestination className="destination-letter" icon="✉️" label="Poste des souhaits" state={gifts.length ? `${gifts.length} confié${gifts.length > 1 ? 's' : ''}` : 'À découvrir'} onClick={() => setIsAddingGift(true)} />
        <WorldDestination className="destination-workshop" icon="🛠️" label="Grand atelier" state={gifts.length ? `${averageProgress}% assemblé` : 'En attente'} onClick={() => scrollToId('souhaits')} />
        <WorldDestination className="destination-message" icon="🎅" label="Grand livre" state={story?.messageSeen ? 'Message reçu' : 'Une lumière brille'} href={`/profil/${profile.id}/message`} highlight={!story?.messageSeen} />
        <WorldDestination className="destination-stars" icon="✨" label="Observatoire" state={deeds.length ? `${deeds.length} étoile${deeds.length > 1 ? 's' : ''}` : 'Mission disponible'} href={`/profil/${profile.id}/gentillometre`} />
        <WorldDestination className="destination-sleigh" icon="🛷" label="Piste du traîneau" state={isChristmasEve ? 'Ouverte !' : 'S’ouvre le 24'} href={isChristmasEve ? `/profil/${profile.id}/24-decembre` : undefined} locked={!isChristmasEve} />

        <article className="current-quest">
          <div className="quest-gem" aria-hidden="true">✦</div>
          <div><p>{currentQuest.eyebrow}</p><h3>{currentQuest.title}</h3><span>{currentQuest.text}</span></div>
          {currentQuest.href ? <Link to={currentQuest.href}>{currentQuest.action} <b>→</b></Link> : <button type="button" onClick={currentQuest.onClick}>{currentQuest.action} <b>→</b></button>}
        </article>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <section className="mission-board" id="missions" aria-labelledby="missions-title">
          <div className="mission-board-title"><span aria-hidden="true">🧭</span><div><p>Journal de quête</p><h2 id="missions-title">Trois lumières à réveiller</h2></div></div>
          <div className="mission-list">
            <MissionItem done={gifts.length > 0} icon="✉️" title="Confier un souhait" reward="+80 éclats" />
            <MissionItem done={Boolean(story?.messageSeen)} icon="📖" title="Ouvrir le grand livre" reward="+100 éclats" />
            <MissionItem done={deeds.length > 0} icon="⭐" title="Faire une bonne action" reward="+50 éclats" />
          </div>
        </section>

        <section id="souhaits" className="wish-section">
          <div className="wish-section-heading">
            <div><p className="eyebrow text-red">La collection de {profile.firstName}</p><h2>{gifts.length === 0 ? 'Le premier chapitre reste à écrire' : `${gifts.length} souhait${gifts.length > 1 ? 's' : ''} dans l’aventure`}</h2></div>
            {gifts.length > 0 && <button type="button" className="quest-button" onClick={() => setIsAddingGift(true)}>＋ Nouveau souhait</button>}
          </div>

          {isAddingGift ? (
            <div className="wish-modal-backdrop" role="presentation"><div className="wish-modal"><GiftForm firstName={profile.firstName} onClose={() => setIsAddingGift(false)} onAdd={(input) => { const gift = appData.addGift({ ...input, profileId: profile.id }); setIsAddingGift(false); setArrivalGift(gift) }} /></div></div>
          ) : gifts.length === 0 ? (
            <button type="button" className="story-empty" onClick={() => setIsAddingGift(true)}><span>✉️</span><strong>Une page blanche t’attend</strong><small>Dépose un souhait pour faire apparaître le chemin lumineux.</small><b>Commencer l’histoire →</b></button>
          ) : (
            <div className="gift-grid grid gap-5 md:grid-cols-2">{gifts.map((gift) => <GiftCard key={gift.id} gift={gift} profileId={profile.id} now={now} />)}</div>
          )}
        </section>

        {isChristmasDay && <Link className="thanks-banner" to={`/profil/${profile.id}/merci`}><span>💌</span><div><strong>Le dernier chapitre est arrivé</strong><small>Les lutins espèrent recevoir un petit merci.</small></div><b>→</b></Link>}
      </div>

      <nav className="game-nav" aria-label="Navigation principale">
        <button type="button" className="active" onClick={() => scrollToId('top')}><span>🗺️</span>Monde</button>
        <button type="button" onClick={() => setIsAddingGift(true)}><span>✉️</span>Souhait</button>
        <button type="button" onClick={() => scrollToId('missions')}><span>🧭</span>Missions</button>
        <Link to={`/profil/${profile.id}/message`}><span>📖</span>Histoire</Link>
      </nav>

      {arrivalGift && <GiftArrival gift={arrivalGift} profileId={profile.id} onClose={() => setArrivalGift(null)} />}
    </main>
  )
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function WorldDestination({ className, icon, label, state, href, onClick, highlight = false, locked = false }: { className: string; icon: string; label: string; state: string; href?: string; onClick?: () => void; highlight?: boolean; locked?: boolean }) {
  const content = <><span className="destination-icon" aria-hidden="true">{locked ? '🔒' : icon}</span><span><strong>{label}</strong><small>{state}</small></span></>
  if (href) return <Link className={`world-destination ${className}`} data-highlight={highlight} to={href}>{content}</Link>
  return <button type="button" className={`world-destination ${className}`} data-highlight={highlight} data-locked={locked} onClick={onClick} disabled={locked}>{content}</button>
}

function MissionItem({ done, icon, title, reward }: { done: boolean; icon: string; title: string; reward: string }) {
  return <article className="mission-item" data-done={done}><span aria-hidden="true">{done ? '✓' : icon}</span><div><strong>{title}</strong><small>{done ? 'Mission accomplie' : reward}</small></div><b>{done ? 'Gagné' : 'À faire'}</b></article>
}

function GiftArrival({ gift, profileId, onClose }: { gift: GiftWish; profileId: string; onClose: () => void }) {
  const [opened, setOpened] = useState(false)
  const elf = getElf(gift.elfId)
  const category = getCategory(gift.categoryId)
  return <div className="arrival-backdrop" role="dialog" aria-modal="true" aria-labelledby="arrival-title"><div className="arrival-card" data-opened={opened}>
    {!opened ? <><div className="magic-seal">✦</div><p className="eyebrow text-gold">Message arrivé du pôle Nord</p><h2 id="arrival-title">Un lutin vient de répondre</h2><p>Le sceau ne s’ouvrira que pour {gift.name}.</p><button type="button" className="arrival-open" onClick={() => setOpened(true)}>Toucher le sceau magique</button></> : <><span className="arrival-elf" aria-hidden="true">{elf.emoji}</span><p className="eyebrow text-gold">Équipe trouvée</p><h2 id="arrival-title">{elf.name} prend la mission !</h2><p>« Je vais commencer par <strong>{category.steps[0].toLocaleLowerCase('fr')}</strong>. Tu pourras revenir voir mes nouvelles chaque jour. »</p><div className="arrival-ticket"><span>{category.emoji}</span><div><small>Bon de fabrication</small><strong>{gift.orderNumber}</strong><em>{gift.name}</em></div></div><div className="arrival-actions"><button type="button" onClick={onClose}>Rester dans le monde</button><Link to={`/profil/${profileId}/cadeau/${gift.id}`}>Suivre la mission →</Link></div></>}
  </div></div>
}
