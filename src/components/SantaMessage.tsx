import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import santaScene from '../assets/santa-message-v2.webp'
import type { AppDataActions } from '../types/domain'

interface SantaMessageProps {
  appData: AppDataActions
}

const SCENE_DURATION = 5600

export function SantaMessage({ appData }: SantaMessageProps) {
  const { profileId } = useParams()
  const [started, setStarted] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(0)
  const profile = appData.data.profiles.find((candidate) => candidate.id === profileId)
  const gifts = appData.data.gifts.filter((gift) => gift.profileId === profileId)
  const goodDeeds = appData.data.goodDeeds.filter((deed) => deed.profileId === profileId)

  const scenes = useMemo(() => {
    if (!profile) return []
    const wishLine = gifts.length === 0
      ? 'Tu peux encore confier un souhait à mes lutins. Ils ont gardé une jolie page pour toi.'
      : gifts.length === 1
        ? 'J’ai bien reçu ton souhait. Les lutins le suivent avec beaucoup de soin.'
        : `J’ai bien reçu tes ${gifts.length} souhaits. Chaque équipe de lutins connaît sa mission.`
    const kindnessLine = goodDeeds.length === 0
      ? 'La magie de Noël grandit avec chaque petit geste gentil. Je sais que tu en as plein en réserve.'
      : goodDeeds.length === 1
        ? 'Une étoile s’est allumée pour ta bonne action. Ici, tout l’atelier l’a remarquée.'
        : `${goodDeeds.length} étoiles brillent déjà pour tes bonnes actions. Quel joli chemin !`

    return [
      { kicker: 'Un message rien que pour toi', text: `Bonsoir ${profile.firstName}… Approche, j’espérais justement te voir.` },
      { kicker: 'Le grand livre', text: `J’ai ouvert ta page. ${profile.firstName}, ${profile.age} ans… oui, c’est bien toi.` },
      { kicker: 'Les souhaits', text: wishLine },
      { kicker: 'La magie en toi', text: kindnessLine },
      { kicker: 'Un secret du pôle Nord', text: 'Continue d’être curieux, courageux et attentionné. Nous pensons très fort à toi. À bientôt !' },
    ]
  }, [gifts.length, goodDeeds.length, profile])

  useEffect(() => {
    if (!started || sceneIndex >= scenes.length - 1) return
    const timer = window.setTimeout(() => setSceneIndex((current) => current + 1), SCENE_DURATION)
    return () => window.clearTimeout(timer)
  }, [sceneIndex, scenes.length, started])

  if (!profile) return <Navigate to="/" replace />
  const scene = scenes[sceneIndex]

  function startMessage() {
    setSceneIndex(0)
    setStarted(true)
  }

  function nextScene() {
    if (sceneIndex < scenes.length - 1) setSceneIndex((current) => current + 1)
    else setStarted(false)
  }

  return (
    <main className="santa-message-screen">
      <div className={`santa-cinema ${started ? 'is-playing' : ''}`} style={{ backgroundImage: `url(${santaScene})` }}>
        <div className="santa-cinema-shade" />
        <Link className="cinema-back" to={`/profil/${profile.id}`}>← Retour</Link>

        {profile.photoDataUrl && (
          <div className="book-photo" aria-hidden="true">
            <img src={profile.photoDataUrl} alt="" />
            <span>Pour {profile.firstName}</span>
          </div>
        )}

        {!started ? (
          <section className="message-intro">
            <p className="eyebrow text-gold">Connexion avec le pôle Nord</p>
            <h1>Un message personnel<br />attend {profile.firstName}</h1>
            <p>Installe-toi confortablement. Le grand livre vient de s’ouvrir rien que pour toi.</p>
            <button className="message-play" type="button" onClick={startMessage}><span aria-hidden="true">▶</span> Recevoir mon message</button>
            <small>Une expérience créée localement avec ton prénom, tes souhaits et tes bonnes actions.</small>
          </section>
        ) : (
          <section className="message-caption" aria-live="polite">
            <div className="message-progress" aria-label={`Partie ${sceneIndex + 1} sur ${scenes.length}`}>
              {scenes.map((_, index) => <i key={index} data-state={index < sceneIndex ? 'done' : index === sceneIndex ? 'active' : 'waiting'} />)}
            </div>
            <p>{scene.kicker}</p>
            <h1>{scene.text}</h1>
            <button type="button" onClick={nextScene}>{sceneIndex === scenes.length - 1 ? 'Revoir le message' : 'Continuer'} <span aria-hidden="true">→</span></button>
          </section>
        )}
      </div>
    </main>
  )
}
