import Image from 'next/image'

const COLOR_PALETTE = [
  'bg-purple-600',
  'bg-blue-600',
  'bg-green-600',
  'bg-orange-500',
  'bg-pink-600',
  'bg-teal-600',
  'bg-red-600',
  'bg-yellow-600',
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
  size?: 'sm' | 'md'
}

export default function Avatar({ userId, firstName, lastName, avatarUrl, size = 'sm' }: AvatarProps) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
  const px = size === 'sm' ? 24 : 32
  const bgColor = COLOR_PALETTE[hashUserId(userId)]

  const initials =
    firstName || lastName
      ? `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`.toUpperCase()
      : '?'

  if (avatarUrl) {
    return (
      <div className={`${sizeClasses} relative rounded-full overflow-hidden ring-2 ring-black flex-shrink-0`}>
        <Image src={avatarUrl} alt={initials} width={px} height={px} className="object-cover w-full h-full" />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses} ${bgColor} rounded-full ring-2 ring-black flex items-center justify-center font-medium text-white flex-shrink-0`}
    >
      {initials}
    </div>
  )
}
