import { ELVES } from '../content/elves'
import { createLocalId } from './id'
import type { CategoryId, GiftWish } from '../types/domain'

function hashText(value: string): number {
  let hash = 0
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return hash
}

function makeOrderNumber(id: string, registeredAt: string): string {
  const year = new Date(registeredAt).getFullYear().toString().slice(-2)
  const code = hashText(id).toString(36).toUpperCase().padStart(5, '0').slice(-5)
  return `NOËL-${year}-${code}`
}

export function createGiftWish(input: { profileId: string; name: string; categoryId: CategoryId; surpriseRevealDate?: string | null; now?: Date }): GiftWish {
  const id = createLocalId()
  const registeredAt = (input.now ?? new Date()).toISOString()
  const elf = ELVES[hashText(id) % ELVES.length]

  return {
    id,
    profileId: input.profileId,
    name: input.name.trim(),
    categoryId: input.categoryId,
    orderNumber: makeOrderNumber(id, registeredAt),
    registeredAt,
    elfId: elf.id,
    status: 'active',
    pausedAt: null,
    surpriseRevealDate: input.surpriseRevealDate ?? null,
    shopping: { found: false, bought: false, hidden: false, price: null },
    decoration: null,
  }
}
