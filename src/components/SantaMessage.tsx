import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import santaScene from '../assets/santa-message-v2.webp'
import { getMagicQuality } from '../content/qualities'
import type { AppDataActions } from '../types/domain'

interface SantaMessageProps {
  appData: AppDataActions
}

const SCENE_DURATION = 5600
const STORY_CHOICES = [
  { id: 'aide', emoji: '🤝', label: 'J’ai aidé quelqu’un', line: 'Tu as choisi d’aider quelqu’un. C’est une magie qui voyage très loin.' },
  { id: 'essai', emoji: '🚀', label: 'J’ai essayé quelque chose', line: 'Tu as osé essayer. Chaque grand voyage commence exactement comme cela.' },
  { id: 'rire', emoji: '😊', label: 'J’ai partagé un sourire', line: 'Tu as partagé un sourire. Ici, une lanterne s’est allumée au même instant.' },
] as const

export function SantaMessage({ appData }: SantaMessageProps) {
  const { profileId } = useParams()
  const [started, setStarted] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [choiceId, setChoiceId] = useState<(typeof STORY_CHOICES)[number]['id'] | null>(null)
  const [foundSparkles, setFoundSparkles] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const profile = appData.data.profiles.find((candidate) => candidate.id === profileId)
  const gifts = appData.data.gifts.filter((gift) => gift.profileId === profileId)
  const goodDeeds = appData.data.goodDeeds.filter((deed) => deed.profileId === profileId)
  const quality = profile ? getMagicQuality(profile.magicQuality) : null
  const storyChoice = STORY_CHOICES.find((choice) => choice.id === choiceId)

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
      { kicker: 'Le grand livre', text: `J’ai ouvert ta page. ${profile.firstName}, ${profile.age} ans… notre ${quality?.label.toLocaleLowerCase('fr')}. Oui, c’est bien toi.` },
      { kicker: 'Les souhaits', text: wishLine },
      { kicker: 'La magie en toi', text: storyChoice?.line ?? kindnessLine },
      { kicker: 'Un secret du pôle Nord', text: 'Continue d’être curieux, courageux et attentionné. Nous pensons très fort à toi. À bientôt !' },
    ]
  }, [gifts.length, goodDeeds.length, profile, quality?.label, storyChoice?.line])

  useEffect(() => {
    if (!started || sceneIndex >= scenes.length - 1) return
    const timer = window.setTimeout(() => setSceneIndex((current) => current + 1), SCENE_DURATION)
    return () => window.clearTimeout(timer)
  }, [sceneIndex, scenes.length, started])

  if (!profile) return <Navigate to="/" replace />
  const scene = scenes[sceneIndex]

  function startMessage() {
    if (!choiceId) return
    setSceneIndex(0)
    setFoundSparkles([])
    setFinished(false)
    setStarted(true)
  }

  function nextScene() {
    if (sceneIndex < scenes.length - 1) setSceneIndex((current) => current + 1)
    else {
      appData.markStoryMessageSeen(profile!.id, foundSparkles.length)
      setStarted(false)
      setFinished(true)
    }
  }

  function catchSparkle(index: number) {
    setFoundSparkles((current) => current.includes(index) ? current : [...current, index])
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

        {!started && !finished ? (
          <section className="message-intro">
            <p className="eyebrow text-gold">Connexion avec le pôle Nord</p>
            <h1>Un message personnel<br />attend {profile.firstName}</h1>
            <p>Installe-toi confortablement. Le grand livre vient de s’ouvrir rien que pour toi.</p>
            <fieldset className="story-choice-field"><legend>Avant d’ouvrir le livre, quelle étincelle as-tu apportée aujourd’hui ?</legend><div>{STORY_CHOICES.map((choice) => <button key={choice.id} type="button" data-selected={choiceId === choice.id} onClick={() => setChoiceId(choice.id)}><span>{choice.emoji}</span>{choice.label}</button>)}</div></fieldset>
            <button className="message-play" type="button" onClick={startMessage} disabled={!choiceId}><span aria-hidden="true">▶</span> {choiceId ? 'Ouvrir mon histoire' : 'Choisis une étincelle'}</button>
            <small>Une expérience créée localement avec ton prénom, tes souhaits et tes bonnes actions.</small>
          </section>
        ) : finished ? (
          <section className="message-finale">
            <div className="finale-star" aria-hidden="true">✦</div>
            <p className="eyebrow text-gold">Chapitre accompli</p>
            <h1>Tu as rapporté {foundSparkles.length} étincelle{foundSparkles.length > 1 ? 's' : ''} à l’atelier.</h1>
            <p>Le chemin de {profile.firstName} brille un peu plus fort. Ton monde a changé pour s’en souvenir.</p>
            <div><button type="button" onClick={() => { setFinished(false); setChoiceId(null) }}>Rejouer</button><Link to={`/profil/${profile.id}`}>Retourner dans mon monde →</Link></div>
          </section>
        ) : (
          <section className="message-caption" aria-live="polite">
            <div className="sparkle-counter"><span>✦</span> {foundSparkles.length}/5 étincelles trouvées</div>
            <div className="message-progress" aria-label={`Partie ${sceneIndex + 1} sur ${scenes.length}`}>
              {scenes.map((_, index) => <i key={index} data-state={index < sceneIndex ? 'done' : index === sceneIndex ? 'active' : 'waiting'} />)}
            </div>
            <p>{scene.kicker}</p>
            <h1>{scene.text}</h1>
            <button type="button" onClick={nextScene}>{sceneIndex === scenes.length - 1 ? 'Terminer le chapitre' : 'Continuer'} <span aria-hidden="true">→</span></button>
          </section>
        )}
        {started && [0, 1, 2, 3, 4].map((sparkle) => <button key={sparkle} type="button" className={`catch-sparkle sparkle-${sparkle + 1}`} data-found={foundSparkles.includes(sparkle)} onClick={() => catchSparkle(sparkle)} aria-label={foundSparkles.includes(sparkle) ? `Étincelle ${sparkle + 1} trouvée` : `Attraper l’étincelle ${sparkle + 1}`}>✦</button>)}
      </div>
    </main>
  )
}
