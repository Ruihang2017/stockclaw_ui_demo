import type { Urgency } from '../types'

const styles: Record<Urgency, string> = {
  BREAKING: 'bg-breaking/20 text-breaking border-breaking/40',
  DIGEST: 'bg-accent-gold/10 text-accent-gold border-accent-gold/40',
  FYI: 'bg-charcoal-600 text-gray-400 border-charcoal-500',
}

interface UrgencyBadgeProps {
  urgency: Urgency
  className?: string
}

export function UrgencyBadge({ urgency, className = '' }: UrgencyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase ${styles[urgency]} ${className}`}
    >
      {urgency}
    </span>
  )
}
