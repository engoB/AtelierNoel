import type { AppData, GiftWish } from '../types/domain'

const STORAGE_KEY = 'atelier-noel:data:v1'

export function createEmptyAppData(): AppData {
  return {
    version: 3,
    profiles: [],
    gifts: [],
    settings: {
      simulatedDate: null,
      parentPinHash: null,
      santaVisitTime: '23:00',
      soundEnabled: true,
      gentillometerPreset: null,
    },
    anecdoteOverrides: {},
    goodDeeds: [],
    thanks: {},
  }
}

export const EMPTY_APP_DATA = createEmptyAppData()

function normalizeGift(value: GiftWish): GiftWish {
  return {
    ...value,
    status: value.status ?? 'active',
    pausedAt: value.pausedAt ?? null,
    surpriseRevealDate: value.surpriseRevealDate ?? null,
    shopping: {
      found: value.shopping?.found ?? false,
      bought: value.shopping?.bought ?? false,
      hidden: value.shopping?.hidden ?? false,
      price: typeof value.shopping?.price === 'number' ? value.shopping.price : null,
    },
    decoration: value.decoration ?? null,
  }
}

export function normalizeAppData(value: unknown): AppData | null {
  if (!value || typeof value !== 'object') return null
  const parsed = value as Partial<AppData> & { version?: number }
  if (!Array.isArray(parsed.profiles) || !Array.isArray(parsed.gifts)) return null

  const defaultData = createEmptyAppData()
  return {
    version: 3,
    profiles: parsed.profiles.map((profile) => ({ ...profile, photoDataUrl: profile.photoDataUrl ?? null })),
    gifts: parsed.gifts.map(normalizeGift),
    settings: { ...defaultData.settings, ...(parsed.settings ?? {}) },
    anecdoteOverrides: parsed.anecdoteOverrides ?? {},
    goodDeeds: Array.isArray(parsed.goodDeeds) ? parsed.goodDeeds : [],
    thanks: parsed.thanks ?? {},
  }
}

export function loadAppData(): AppData {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY)
    if (!storedValue) return createEmptyAppData()
    return normalizeAppData(JSON.parse(storedValue)) ?? createEmptyAppData()
  } catch {
    return createEmptyAppData()
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // L’application reste utilisable en mémoire si le navigateur bloque le stockage sur file://.
  }
}
