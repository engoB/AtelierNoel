import type { MagicQualityId } from '../types/domain'

export interface MagicQuality {
  id: MagicQualityId
  emoji: string
  label: string
  adjective: string
  storyLine: string
}

export const MAGIC_QUALITIES: MagicQuality[] = [
  { id: 'curieux', emoji: '🔭', label: 'Explorateur', adjective: 'curieux', storyLine: 'Tu remarques les détails que même les lutins oublient.' },
  { id: 'genereux', emoji: '💛', label: 'Grand cœur', adjective: 'attentionné', storyLine: 'Tu sais partager la chaleur de Noël autour de toi.' },
  { id: 'courageux', emoji: '🦁', label: 'Cœur brave', adjective: 'courageux', storyLine: 'Tu avances même lorsque le chemin semble nouveau.' },
  { id: 'imaginatif', emoji: '🌈', label: 'Créateur', adjective: 'imaginatif', storyLine: 'Tes idées ouvrent des portes invisibles aux autres.' },
]

export function getMagicQuality(id: MagicQualityId): MagicQuality {
  return MAGIC_QUALITIES.find((quality) => quality.id === id) ?? MAGIC_QUALITIES[0]
}
