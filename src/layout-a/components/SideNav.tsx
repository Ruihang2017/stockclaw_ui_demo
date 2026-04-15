import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Star, MessageSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

const COLLAPSED_STORAGE_KEY = 'stockclaw_sidenav_collapsed'
const MOBILE_BREAKPOINT = 768

interface SideNavProps {
  signalsToday?: number
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/watchlist', label: 'Watchlist', icon: Star, end: false },
  { to: '/chat', label: 'Claw Chat', icon: MessageSquare, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const

export function SideNav({ signalsToday = 0 }: SideNavProps) {
  const [userCollapsed, setUserCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(COLLAPSED_STORAGE_KEY)
      return v === '1'
    } catch {
      return false
    }
  })
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  )

  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const collapsed = isSmallScreen || userCollapsed

  const toggle = () => {
    setUserCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? '1' : '0') } catch {}
      return next
    })
  }

  return (
    <nav
      className={`flex shrink-0 flex-col border-r border-charcoal-600 bg-charcoal-900 transition-[width] duration-200 ${
        collapsed ? 'w-14' : 'w-[180px]'
      }`}
      aria-label="Primary"
    >
      <div className="flex flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const showBadge = item.label === 'Dashboard' && signalsToday > 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded px-2 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-charcoal-800 text-accent-gold'
                    : 'text-gray-400 hover:bg-charcoal-800 hover:text-gray-200'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {showBadge && (
                <span
                  className={`${collapsed ? 'absolute right-1 top-1' : 'ml-auto'} h-1.5 w-1.5 rounded-full bg-accent-gold`}
                  aria-label={`${signalsToday} new signals`}
                />
              )}
            </NavLink>
          )
        })}
      </div>
      {!isSmallScreen && (
        <button
          type="button"
          onClick={toggle}
          className="mt-auto flex items-center gap-2 border-t border-charcoal-600 px-3 py-2 text-[10px] text-gray-500 hover:text-gray-300"
          aria-label={userCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {userCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          {!collapsed && <span>collapse</span>}
        </button>
      )}
    </nav>
  )
}
