import { getAvatar } from '../content/avatars'

interface AvatarBadgeProps {
  avatarId: string
  photoDataUrl?: string | null
  size?: 'small' | 'large'
}

export function AvatarBadge({ avatarId, photoDataUrl, size = 'large' }: AvatarBadgeProps) {
  const avatar = getAvatar(avatarId)
  const sizeClass = size === 'small' ? 'size-12 text-2xl rounded-2xl' : 'size-20 text-4xl rounded-3xl'

  return (
    <span
      className={`profile-avatar grid shrink-0 place-items-center overflow-hidden shadow-inner ${sizeClass}`}
      style={{ backgroundColor: `${avatar.color}22`, border: `2px solid ${avatar.color}33` }}
      role="img" aria-label={photoDataUrl ? 'Photo du profil' : avatar.label}
    >
      {photoDataUrl ? <img src={photoDataUrl} alt="" /> : avatar.emoji}
    </span>
  )
}
