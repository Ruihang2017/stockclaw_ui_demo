import { useEffect, useRef } from 'react'
import type { NotificationItem } from '../types'

interface NotificationsDropdownProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  className?: string
  /** Ref to the container that includes the trigger button; used so clicking the trigger doesn't close the dropdown */
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function NotificationsDropdown({
  isOpen,
  onClose,
  notifications,
  className = '',
  containerRef,
}: NotificationsDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const el = containerRef?.current ?? panelRef.current
      if (el && !el.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, containerRef])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className={`absolute right-0 top-full z-20 mt-1 w-72 rounded border border-charcoal-600 bg-charcoal-800 py-1 shadow-panel ${className}`}
    >
      <div className="border-b border-charcoal-600 px-3 py-1.5 text-[10px] uppercase text-gray-500">
        Notifications
      </div>
      <div className="max-h-64 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="border-b border-charcoal-700 px-3 py-2 last:border-b-0 hover:bg-charcoal-700/50"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-gray-200">{n.title}</p>
              {n.type === 'breaking' && (
                <span className="shrink-0 rounded bg-breaking/20 px-1 py-0.5 text-[10px] text-breaking">
                  BREAKING
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-gray-500">{n.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
