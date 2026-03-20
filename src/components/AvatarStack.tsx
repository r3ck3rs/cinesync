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
}

export default function AvatarStack({ attendees, max = 4 }: AvatarStackProps) {
  const visible = attendees.slice(0, max)
  const overflow = attendees.length - max

  return (
    <div className="flex items-center">
      {visible.map((attendee, index) => (
        <div key={attendee.userId} className={index > 0 ? '-ml-1.5' : ''}>
          <Avatar
            userId={attendee.userId}
            firstName={attendee.firstName}
            lastName={attendee.lastName}
            avatarUrl={attendee.avatarUrl}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div className="-ml-1.5 w-6 h-6 rounded-full ring-2 ring-black bg-gray-700 flex items-center justify-center text-xs text-gray-300 font-medium flex-shrink-0">
          +{overflow}
        </div>
      )}
    </div>
  )
}
