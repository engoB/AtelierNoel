import { GIFT_CATEGORIES } from '../content/categories'
import type { CategoryId } from '../types/domain'

export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function detectCategory(giftName: string): CategoryId {
  const normalizedName = ` ${normalizeForSearch(giftName)} `
  const matches = GIFT_CATEGORIES.flatMap((category) =>
    category.keywords
      .filter((keyword) => normalizedName.includes(` ${normalizeForSearch(keyword)} `))
      .map((keyword) => ({ categoryId: category.id, score: normalizeForSearch(keyword).length })),
  ).sort((a, b) => b.score - a.score)

  return matches[0]?.categoryId ?? 'mystere'
}
