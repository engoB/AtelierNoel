export interface AvatarOption {
  id: string
  emoji: string
  label: string
  color: string
}

export const AVATARS: AvatarOption[] = [
  { id: 'renne', emoji: '🦌', label: 'Renne joyeux', color: '#b86b45' },
  { id: 'ours', emoji: '🐻', label: 'Ours polaire', color: '#5f83a6' },
  { id: 'lapin', emoji: '🐰', label: 'Lapin des neiges', color: '#916e9f' },
  { id: 'hibou', emoji: '🦉', label: 'Hibou du soir', color: '#527665' },
  { id: 'renard', emoji: '🦊', label: 'Renard malin', color: '#bd613c' },
  { id: 'pingouin', emoji: '🐧', label: 'Pingouin danseur', color: '#3f6479' },
  { id: 'etoile', emoji: '⭐', label: 'Étoile brillante', color: '#b7892f' },
  { id: 'sapin', emoji: '🎄', label: 'Petit sapin', color: '#2f6a4f' },
]

export function getAvatar(avatarId: string): AvatarOption {
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? AVATARS[0]
}
