import Link from 'next/link'

interface BottomNavProps {
  active?: 'feed' | 'plans' | 'profile'
}

export default function BottomNav({ active = 'feed' }: BottomNavProps) {
  const items = [
    {
      id: 'feed',
      href: '/feed',
      label: 'Feed',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      id: 'plans',
      href: '/feed',
      label: 'Plans',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
          <path d="M13 5v2"/>
          <path d="M13 17v2"/>
          <path d="M13 11v2"/>
        </svg>
      ),
    },
    {
      id: 'friends',
      href: null,
      label: 'Vrienden',
      disabled: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      href: '/profile',
      label: 'Profiel',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 px-2 pb-safe"
      style={{
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = active === item.id
          const style = isActive
            ? { color: 'var(--text)' }
            : item.disabled
            ? { color: 'var(--subtle)', cursor: 'not-allowed' }
            : { color: 'var(--muted)' }

          const inner = (
            <div className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-150">
              <div>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </div>
          )

          if (!item.href || item.disabled) {
            return (
              <span key={item.id} style={style}>
                {inner}
              </span>
            )
          }

          return (
            <Link key={item.id} href={item.href} style={style} className="hover:opacity-80 transition-opacity">
              {inner}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
