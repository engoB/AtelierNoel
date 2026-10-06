import { toDateKey } from './progression'
import type { GiftWish } from '../types/domain'

export function isGiftVisibleToChild(gift: GiftWish, now: Date): boolean {
  return !gift.surpriseRevealDate || toDateKey(now) >= gift.surpriseRevealDate
}
