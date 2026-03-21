import Image from 'next/image'

// Monochrome palette — grayscale shades for black/white dark mode
const COLOR_PALETTE = [
  'bg-[#2a2a2a]',
  'bg-[#333333]',
  'bg-[#3d3d3d]',
  'bg-[#444444]',
  'bg-[#2a2a2a]',
  'bg-[#333333]',
  'bg-[#3d3d3d]',
  'bg-[#444444]',
]

function hashUserId(userId: string): number {
  let sum = 0
  for (let i = 0; i < userId.length; i++) {
    sum += userId.charCodeAt(i)
  }
  return sum % 8
}

interface AvatarProps {
  userId: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ userId, firstName, lastName, avatarUrl, size = 'sm' }: AvatarProps) {
  const sizeClasses =
    size === 'lg' ? 'w-14 h-14 text-lg' :
    size === 'md' ? 'w-8 h-8 text-xs' :
    'w-6 h-6 text-[10px]'
  const px = size === 'lg' ? 56 : size === 'md' ? 32 : 24
  const bgColor = COLOR_PALETTE[hashUserId(userId)]

  const initials =
    firstName || lastName
      ? `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`.toUpperCase()
      : '?'

  if (avatarUrl) {
    return (
      <div
        className={`${sizeClasses} relative rounded-full overflow-hidden ring-2 ring-[var(--surface)] flex-shrink-0`}
        style={{ boxShadow: '0 0 0 1.5px rgba(255,255,255,0.08)' }}
      >
        <Image
          src={avatarUrl}
          alt={initials}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses} ${bgColor} rounded-full ring-2 ring-[var(--surface)] flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
    >
      {initials}
    </div>
  )
}
