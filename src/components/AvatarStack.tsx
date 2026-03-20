import Avatar from './Avatar'

interface Attendee {
  userId: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

interface AvatarStackProps {
  attendees: Attendee[]
  max?: number
  size?: 'sm' | 'md'
}

export default function AvatarStack({ attendees, max = 4, size = 'sm' }: AvatarStackProps) {
  const visible = attendees.slice(0, max)
  const overflow = attendees.length - max

  return (
    <div className="flex items-center">
      {visible.map((attendee, index) => (
        <div
          key={attendee.userId}
          className={index > 0 ? '-ml-2' : ''}
          style={{ zIndex: visible.length - index }}
        >
          <Avatar
            userId={attendee.userId}
            firstName={attendee.firstName}
            lastName={attendee.lastName}
            avatarUrl={attendee.avatarUrl}
            size={size}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="-ml-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{
            background: 'var(--overlay)',
            border: '2px solid var(--surface)',
            color: 'var(--muted)',
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
