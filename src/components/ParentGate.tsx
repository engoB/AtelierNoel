import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

import { ParentDashboard } from './ParentDashboard'
import { hashPin, isValidPin } from '../lib/pin'
import type { AppDataActions } from '../types/domain'

interface ParentGateProps {
  appData: AppDataActions
}

export function ParentGate({ appData }: ParentGateProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const hasPin = Boolean(appData.data.settings.parentPinHash)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!isValidPin(pin)) {
      setError('Le code doit contenir exactement 4 chiffres.')
      return
    }

    if (!hasPin) {
      if (pin !== confirmPin) {
        setError('Les deux codes ne sont pas identiques.')
        return
      }
      appData.setParentPinHash(hashPin(pin))
      setAuthenticated(true)
      return
    }

    if (hashPin(pin) !== appData.data.settings.parentPinHash) {
      setError('Ce code ne correspond pas.')
      return
    }
    setAuthenticated(true)
  }

  if (authenticated) return <ParentDashboard appData={appData} onLock={() => setAuthenticated(false)} />

  return (
    <main className="app-shell">
      <div className="snow" aria-hidden="true" />
      <section className="page-card relative z-10 w-full max-w-md p-6 sm:p-9">
        <Link className="text-sm font-extrabold text-pine/65 underline" to="/">Retour aux enfants</Link>
        <div className="mt-6 text-center">
          <span className="text-5xl" aria-hidden="true">🔐</span>
          <p className="eyebrow mt-4 text-red">Espace réservé</p>
          <h1 className="font-display text-3xl font-bold text-pine">Mode parent</h1>
          <p className="mt-2 text-base leading-relaxed text-ink/65">
            {hasPin ? 'Entre le code à 4 chiffres.' : 'Choisis un code à 4 chiffres pour protéger les coulisses.'}
          </p>
        </div>

        <form className="mt-6" onSubmit={handleSubmit}>
          <label className="field-label">
            Code PIN
            <input className="pin-field" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} type="password" inputMode="numeric" autoComplete="off" maxLength={4} required />
          </label>
          {!hasPin && (
            <label className="field-label mt-4">
              Confirme le code
              <input className="pin-field" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 4))} type="password" inputMode="numeric" autoComplete="off" maxLength={4} required />
            </label>
          )}
          {error && <p className="mt-3 rounded-xl bg-red/10 p-3 text-sm font-bold text-red" role="alert">{error}</p>}
          <button className="primary-button mt-5 w-full" type="submit">{hasPin ? 'Ouvrir les coulisses' : 'Créer le code'}</button>
        </form>
      </section>
    </main>
  )
}
