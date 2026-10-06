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
  return detectCategoryMatches(giftName)[0]?.categoryId ?? 'mystere'
}

export interface CategoryMatch {
  categoryId: CategoryId
  score: number
  confidence: 'forte' | 'moyenne' | 'faible'
}

export function detectCategoryMatches(giftName: string): CategoryMatch[] {
  const normalizedName = normalizeForSearch(giftName)
  if (!normalizedName) return [{ categoryId: 'mystere', score: 0, confidence: 'faible' }]
  const nameTokens = normalizedName.split(' ').filter(Boolean)

  const matches = GIFT_CATEGORIES
    .filter((category) => category.id !== 'mystere')
    .map((category) => {
      const score = category.keywords.reduce((best, rawKeyword) => {
        const keyword = normalizeForSearch(rawKeyword)
        const keywordTokens = keyword.split(' ')
        let current = 0
        if (normalizedName === keyword) current = 120
        else if (` ${normalizedName} `.includes(` ${keyword} `)) current = 90 + keyword.length

        const tokenHits = keywordTokens.filter((keywordToken) => nameTokens.some((nameToken) => {
          if (nameToken === keywordToken) return true
          if (nameToken.length < 5 || keywordToken.length < 5) return false
          return nameToken.startsWith(keywordToken.slice(0, 5)) || keywordToken.startsWith(nameToken.slice(0, 5))
        })).length
        current = Math.max(current, tokenHits ? 24 * (tokenHits / keywordTokens.length) : 0)
        return Math.max(best, current)
      }, 0)
      return { categoryId: category.id, score }
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)

  if (!matches.length) return [{ categoryId: 'mystere', score: 0, confidence: 'faible' }]
  return matches.map((match, index) => ({
    ...match,
    confidence: match.score >= 80 && index === 0 ? 'forte' : match.score >= 24 ? 'moyenne' : 'faible',
  }))
}
