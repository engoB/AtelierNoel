import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AvatarBadge } from './AvatarBadge'
import { AVATARS } from '../content/avatars'
import workshopPortal from '../assets/workshop-portal-v2.webp'
import { prepareProfilePhoto } from '../lib/profilePhoto'
import type { AppDataActions } from '../types/domain'

interface ProfilePickerProps {
  appData: AppDataActions
}

export function ProfilePicker({ appData }: ProfilePickerProps) {
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(appData.data.profiles.length === 0)
  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState('')
  const [avatarId, setAvatarId] = useState(AVATARS[0].id)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')
  const parentTimer = useRef<number | null>(null)

  function startParentGesture() {
    parentTimer.current = window.setTimeout(() => navigate('/parents'), 1200)
  }

  function cancelParentGesture() {
    if (parentTimer.current) window.clearTimeout(parentTimer.current)
    parentTimer.current = null
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedAge = Number(age)
    if (!firstName.trim() || !Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 17) return

    const profile = appData.addProfile({ firstName, age: parsedAge, avatarId, photoDataUrl })
    navigate(`/profil/${profile.id}`)
  }

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setPhotoError('')
      setPhotoDataUrl(await prepareProfilePhoto(file))
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Cette photo ne peut pas être utilisée.')
    }
    event.target.value = ''
  }

  return (
    <main className="welcome-shell">
      <div className="snow" aria-hidden="true" />
      <section className="welcome-card relative z-10 mx-auto w-full max-w-6xl">
        <div className="welcome-visual" style={{ backgroundImage: `url(${workshopPortal})` }}>
          <div className="welcome-brand">
            <span className="brand-star" aria-hidden="true">✦</span>
            <p className="eyebrow text-gold">La porte vient de s’ouvrir</p>
            <h1 className="font-display text-4xl font-bold leading-[1.03] text-cream sm:text-6xl">L’Atelier<br />du Père Noël</h1>
            <p className="mt-4 max-w-md text-base font-semibold leading-relaxed text-cream/80 sm:text-lg">Entre. Quelqu’un au pôle Nord connaît déjà ton prénom.</p>
          </div>
        </div>

        <div className="welcome-panel">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-red">Le carnet de la famille</p>
              <h2 className="font-display text-3xl font-bold leading-tight text-pine sm:text-4xl">Qui pousse la porte ?</h2>
              <p className="mt-2 text-base leading-relaxed text-ink/60">Choisis ton portrait pour retrouver tes souhaits.</p>
            </div>
            <button className="secret-parent-trigger" type="button" aria-label="Décoration cadeau" onPointerDown={startParentGesture} onPointerUp={cancelParentGesture} onPointerLeave={cancelParentGesture}>🎁</button>
          </header>

          {appData.data.profiles.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {appData.data.profiles.map((profile) => (
                <button key={profile.id} type="button" className="profile-card group" onClick={() => navigate(`/profil/${profile.id}`)}>
                  <AvatarBadge avatarId={profile.avatarId} photoDataUrl={profile.photoDataUrl} />
                  <span className="min-w-0 text-left">
                    <span className="block truncate font-display text-2xl font-bold text-pine">{profile.firstName}</span>
                    <span className="mt-1 block text-base text-ink/60">{profile.age} ans</span>
                  </span>
                  <span className="profile-enter" aria-hidden="true">Entrer</span>
                </button>
              ))}
            </div>
          )}

          {!isAdding ? (
            <button type="button" className="secondary-button mt-6 w-full sm:w-auto" onClick={() => setIsAdding(true)}>
              <span aria-hidden="true">＋</span> Ajouter un enfant
            </button>
          ) : (
            <form className="profile-form mt-6" onSubmit={handleSubmit}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow text-red">Nouveau profil</p>
                  <h2 className="font-display text-2xl font-bold text-pine">Faisons connaissance</h2>
                </div>
                {appData.data.profiles.length > 0 && (
                  <button type="button" className="icon-button" onClick={() => setIsAdding(false)} aria-label="Fermer le formulaire">×</button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field-label">
                  Prénom
                  <input className="text-field" value={firstName} onChange={(event) => setFirstName(event.target.value)} maxLength={30} autoComplete="given-name" required />
                </label>
                <label className="field-label">
                  Âge
                  <input className="text-field" value={age} onChange={(event) => setAge(event.target.value)} type="number" min="1" max="17" inputMode="numeric" required />
                </label>
              </div>

              <div className="photo-picker mt-5">
                <AvatarBadge avatarId={avatarId} photoDataUrl={photoDataUrl} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-pine">Ajoute ta photo <span className="font-normal text-pine/50">(facultatif)</span></p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/55">Elle apparaîtra dans les messages magiques et restera sur cet appareil.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="photo-button">📷 Choisir une photo<input className="sr-only" type="file" accept="image/*" onChange={handlePhoto} /></label>
                    {photoDataUrl && <button className="photo-remove" type="button" onClick={() => setPhotoDataUrl(null)}>Retirer</button>}
                  </div>
                  {photoError && <p className="mt-2 text-sm font-bold text-red" role="alert">{photoError}</p>}
                </div>
              </div>

              <fieldset className="mt-5">
                <legend className="field-label mb-3">Ou choisis un compagnon</legend>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                  {AVATARS.map((avatar) => (
                    <label key={avatar.id} className="avatar-choice" data-selected={avatarId === avatar.id} title={avatar.label}>
                      <input className="sr-only" type="radio" name="avatar" value={avatar.id} checked={avatarId === avatar.id} onChange={() => setAvatarId(avatar.id)} />
                      <span role="img" aria-label={avatar.label}>{avatar.emoji}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button className="primary-button mt-6 w-full sm:w-auto" type="submit">Entrer dans l’atelier</button>
            </form>
          )}

          <div className="privacy-note"><span aria-hidden="true">✦</span><p><strong>Un jardin secret.</strong> Les souvenirs restent uniquement sur cet appareil.</p></div>
        </div>
      </section>
    </main>
  )
}
