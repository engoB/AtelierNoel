export type CategoryId =
  | 'electronique'
  | 'peluche'
  | 'livre'
  | 'vehicule'
  | 'construction'
  | 'jeu-societe'
  | 'poupee-figurine'
  | 'vetement-accessoire'
  | 'sport'
  | 'loisirs-creatifs'
  | 'mystere'

export type MagicQualityId = 'curieux' | 'genereux' | 'courageux' | 'imaginatif'

export interface ChildProfile {
  id: string
  firstName: string
  age: number
  avatarId: string
  photoDataUrl: string | null
  magicQuality: MagicQualityId
  createdAt: string
}

export interface GiftWish {
  id: string
  profileId: string
  name: string
  categoryId: CategoryId
  orderNumber: string
  registeredAt: string
  elfId: string
  status: 'active' | 'considering'
  pausedAt: string | null
  surpriseRevealDate: string | null
  shopping: {
    found: boolean
    bought: boolean
    hidden: boolean
    price: number | null
  }
  decoration: 'star' | 'snowflake' | null
}

export interface GoodDeed {
  id: string
  profileId: string
  recordedAt: string
  reward: 'star' | 'snowflake' | 'message'
  message: string
}

export interface StoryProgress {
  messageSeen: boolean
  sparklesFound: number
}

export interface AppData {
  version: 4
  profiles: ChildProfile[]
  gifts: GiftWish[]
  settings: {
    simulatedDate: string | null
    parentPinHash: string | null
    santaVisitTime: string
    soundEnabled: boolean
    gentillometerPreset: string | null
  }
  anecdoteOverrides: Record<string, string>
  goodDeeds: GoodDeed[]
  thanks: Record<string, string>
  storyProgress: Record<string, StoryProgress>
}

export interface AppDataActions {
  data: AppData
  addProfile: (profile: Omit<ChildProfile, 'id' | 'createdAt'>) => ChildProfile
  addGift: (gift: Pick<GiftWish, 'profileId' | 'name' | 'categoryId'> & Partial<Pick<GiftWish, 'surpriseRevealDate'>>) => GiftWish
  updateProfile: (profileId: string, changes: Partial<Pick<ChildProfile, 'firstName' | 'age' | 'avatarId' | 'photoDataUrl' | 'magicQuality'>>) => void
  deleteProfile: (profileId: string) => void
  updateGift: (giftId: string, changes: Partial<Omit<GiftWish, 'id' | 'profileId' | 'registeredAt' | 'orderNumber' | 'elfId'>>) => void
  deleteGift: (giftId: string) => void
  setSimulatedDate: (date: string | null) => void
  setParentPinHash: (hash: string) => void
  setSantaVisitTime: (time: string) => void
  setSoundEnabled: (enabled: boolean) => void
  setGentillometerPreset: (preset: string | null) => void
  setAnecdoteOverride: (giftId: string, date: string, text: string) => void
  recordGoodDeed: (profileId: string) => GoodDeed
  sendThanks: (profileId: string, elfId: string, message: string) => void
  markStoryMessageSeen: (profileId: string, sparklesFound: number) => void
  importData: (data: AppData) => void
  resetData: () => void
}
