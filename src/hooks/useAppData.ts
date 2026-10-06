import { useEffect, useState } from 'react'

import { createGiftWish } from '../lib/giftFactory'
import { createLocalId } from '../lib/id'
import { createEmptyAppData, loadAppData, saveAppData } from '../lib/storage'
import type { AppDataActions, ChildProfile, GoodDeed } from '../types/domain'

const GOOD_DEED_MESSAGES = [
  'Le Père Noël a vu ton joli geste. Il t’envoie une pluie d’étoiles !',
  'Les lutins applaudissent ta bonne action très fort.',
  'Un petit geste gentil peut réchauffer tout l’atelier.',
]

export function useAppData(): AppDataActions {
  const [data, setData] = useState(loadAppData)

  useEffect(() => saveAppData(data), [data])

  return {
    data,
    addProfile(profileInput) {
      const profile: ChildProfile = {
        ...profileInput,
        id: createLocalId(),
        firstName: profileInput.firstName.trim(),
        createdAt: new Date().toISOString(),
      }
      setData((current) => ({ ...current, profiles: [...current.profiles, profile] }))
      return profile
    },
    addGift(giftInput) {
      const gift = createGiftWish(giftInput)
      setData((current) => ({ ...current, gifts: [...current.gifts, gift] }))
      return gift
    },
    updateProfile(profileId, changes) {
      setData((current) => ({
        ...current,
        profiles: current.profiles.map((profile) => profile.id === profileId ? { ...profile, ...changes } : profile),
      }))
    },
    deleteProfile(profileId) {
      setData((current) => ({
        ...current,
        profiles: current.profiles.filter((profile) => profile.id !== profileId),
        gifts: current.gifts.filter((gift) => gift.profileId !== profileId),
        goodDeeds: current.goodDeeds.filter((deed) => deed.profileId !== profileId),
      }))
    },
    updateGift(giftId, changes) {
      setData((current) => ({
        ...current,
        gifts: current.gifts.map((gift) => {
          if (gift.id !== giftId) return gift
          const statusChanged = changes.status && changes.status !== gift.status
          return {
            ...gift,
            ...changes,
            pausedAt: statusChanged ? (changes.status === 'considering' ? new Date().toISOString() : null) : (changes.pausedAt ?? gift.pausedAt),
          }
        }),
      }))
    },
    deleteGift(giftId) {
      setData((current) => ({ ...current, gifts: current.gifts.filter((gift) => gift.id !== giftId) }))
    },
    setSimulatedDate(date) {
      setData((current) => ({ ...current, settings: { ...current.settings, simulatedDate: date } }))
    },
    setParentPinHash(hash) {
      setData((current) => ({ ...current, settings: { ...current.settings, parentPinHash: hash } }))
    },
    setSantaVisitTime(time) {
      setData((current) => ({ ...current, settings: { ...current.settings, santaVisitTime: time } }))
    },
    setSoundEnabled(enabled) {
      setData((current) => ({ ...current, settings: { ...current.settings, soundEnabled: enabled } }))
    },
    setGentillometerPreset(preset) {
      setData((current) => ({ ...current, settings: { ...current.settings, gentillometerPreset: preset } }))
    },
    setAnecdoteOverride(giftId, date, text) {
      const key = `${giftId}|${date}`
      setData((current) => {
        const next = { ...current.anecdoteOverrides }
        if (text.trim()) next[key] = text.trim()
        else delete next[key]
        return { ...current, anecdoteOverrides: next }
      })
    },
    recordGoodDeed(profileId) {
      const previousCount = data.goodDeeds.filter((deed) => deed.profileId === profileId).length
      const reward: GoodDeed['reward'] = previousCount % 3 === 0 ? 'star' : previousCount % 3 === 1 ? 'snowflake' : 'message'
      const deed: GoodDeed = {
        id: createLocalId(),
        profileId,
        recordedAt: new Date().toISOString(),
        reward,
        message: GOOD_DEED_MESSAGES[previousCount % GOOD_DEED_MESSAGES.length],
      }
      setData((current) => {
        let decorated = false
        return {
          ...current,
          goodDeeds: [...current.goodDeeds, deed],
          gifts: current.gifts.map((gift) => {
            if (gift.profileId !== profileId || gift.decoration || decorated) return gift
            decorated = true
            return { ...gift, decoration: reward === 'snowflake' ? 'snowflake' : 'star' }
          }),
        }
      })
      return deed
    },
    sendThanks(profileId, elfId, message) {
      setData((current) => ({ ...current, thanks: { ...current.thanks, [`${profileId}|${elfId}`]: message } }))
    },
    markStoryMessageSeen(profileId, sparklesFound) {
      setData((current) => ({
        ...current,
        storyProgress: {
          ...current.storyProgress,
          [profileId]: {
            messageSeen: true,
            sparklesFound: Math.max(current.storyProgress[profileId]?.sparklesFound ?? 0, sparklesFound),
          },
        },
      }))
    },
    importData(imported) {
      setData(imported)
    },
    resetData() {
      setData(createEmptyAppData())
    },
  }
}
