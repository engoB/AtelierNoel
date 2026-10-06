import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { ELVES } from '../content/elves'
import type { AppDataActions } from '../types/domain'

export function ChristmasThanks({ appData }: { appData: AppDataActions }) {
  const { profileId } = useParams()
  const profile = appData.data.profiles.find((candidate) => candidate.id === profileId)
  const [message, setMessage] = useState('Merci pour tout !')
  if (!profile) return <Navigate to="/" replace />

  const assignedIds = [...new Set(appData.data.gifts.filter((gift) => gift.profileId === profile.id).map((gift) => gift.elfId))]
  const elves = assignedIds.length > 0 ? assignedIds.map((id) => ELVES.find((elf) => elf.id === id)!).filter(Boolean) : ELVES.slice(0, 4)

  return (
    <main className="thanks-screen">
      <header className="workshop-header"><div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4 sm:px-8"><Link className="header-button" to={`/profil/${profile.id}`}>‹ Atelier</Link><div className="ml-auto text-right"><p className="text-sm font-bold text-gold">25 décembre</p><h1 className="font-display text-2xl font-bold text-cream">Merci les lutins !</h1></div></div></header>
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8">
        <section className="text-center"><span className="text-6xl" aria-hidden="true">💌</span><h2 className="mt-4 font-display text-4xl font-bold text-pine">Un petit merci, {profile.firstName} ?</h2><p className="mx-auto mt-3 max-w-xl text-lg text-ink/65">Les lutins qui ont préparé tes souhaits seraient très heureux de recevoir un message.</p></section>
        <label className="field-label mx-auto mt-7 max-w-xl">Ton message<input className="text-field" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={100} /></label>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {elves.map((elf) => {
            const saved = appData.data.thanks[`${profile.id}|${elf.id}`]
            return <article key={elf.id} className="elf-thanks-card" data-thanked={Boolean(saved)}><span className="text-5xl" aria-hidden="true">{elf.emoji}</span><div><h3 className="font-display text-2xl font-bold text-pine">{elf.name}</h3><p className="text-sm text-ink/60">{elf.trait}</p></div>{saved ? <p className="elf-reply">“Merci {profile.firstName} ! Ton message fait danser mon bonnet.”</p> : <button className="primary-button col-span-full" type="button" disabled={!message.trim()} onClick={() => appData.sendThanks(profile.id, elf.id, message.trim())}>Envoyer à {elf.name}</button>}</article>
          })}
        </div>
      </div>
    </main>
  )
}
