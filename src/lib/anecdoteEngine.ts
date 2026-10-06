import { CATEGORY_ANECDOTES, LATE_GIFT_ANECDOTE, WORKSHOP_ANECDOTES } from '../content/anecdotes'
import { getElf } from '../content/elves'
import { getGiftSchedule, startOfLocalDay, toDateKey } from './progression'
import type { ChildProfile, GiftWish } from '../types/domain'

const DAY_MS = 24 * 60 * 60 * 1000

export interface JournalEntry {
  date: string
  text: string
  kind: 'workshop' | 'category' | 'late'
}

function hashText(value: string): number {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function stableOrder(bank: readonly string[], seed: string): string[] {
  return bank
    .map((text, index) => ({ text, score: hashText(`${seed}|${index}|${text}`) }))
    .sort((a, b) => a.score - b.score)
    .map(({ text }) => text)
}

function fillVariables(template: string, gift: GiftWish, profile: ChildProfile): string {
  const elf = getElf(gift.elfId)
  const giftLabel = gift.categoryId === 'mystere' ? 'le souhait secret' : gift.name
  return template
    .replaceAll('{lutin}', elf.name)
    .replaceAll('{prenom}', profile.firstName)
    .replaceAll('{cadeau}', giftLabel)
}

export function getGiftJournal(gift: GiftWish, profile: ChildProfile, now: Date): JournalEntry[] {
  const schedule = getGiftSchedule(gift.registeredAt)
  const today = startOfLocalDay(now)
  const finalDay = startOfLocalDay(schedule.end)
  const lastDay = today < finalDay ? today : finalDay
  if (lastDay < schedule.start) return []

  const dayCount = Math.floor((lastDay.getTime() - schedule.start.getTime()) / DAY_MS) + 1
  const workshopOrder = stableOrder(WORKSHOP_ANECDOTES, `${gift.id}|workshop`)
  const categoryOrder = stableOrder(CATEGORY_ANECDOTES[gift.categoryId], `${gift.id}|${gift.categoryId}`)
  const categoryOffset = hashText(gift.id) % 3
  let workshopIndex = 0
  let categoryIndex = 0
  const entries: JournalEntry[] = []

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
    const date = new Date(schedule.start.getTime() + dayIndex * DAY_MS)
    let template: string
    let kind: JournalEntry['kind']

    if (schedule.isLate && dayIndex === 0) {
      template = LATE_GIFT_ANECDOTE
      kind = 'late'
    } else if ((dayIndex + categoryOffset) % 3 === 2) {
      template = categoryOrder[categoryIndex % categoryOrder.length]
      categoryIndex += 1
      kind = 'category'
    } else {
      template = workshopOrder[workshopIndex % workshopOrder.length]
      workshopIndex += 1
      kind = 'workshop'
    }

    entries.push({ date: toDateKey(date), text: fillVariables(template, gift, profile), kind })
  }

  return entries
}
