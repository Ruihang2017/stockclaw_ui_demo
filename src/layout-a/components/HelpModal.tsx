interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  feedbackHref: string
}

export function HelpModal({ isOpen, onClose, feedbackHref }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60"
        aria-hidden
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded border border-charcoal-600 bg-charcoal-900 p-4 shadow-panel">
        <h2 className="mb-3 text-sm font-medium text-gray-200">Help</h2>
        <p className="mb-3 text-xs leading-relaxed text-gray-300">
          StockClaw Dashboard Demo v2. This is a prototype — all data is mocked.
        </p>
        <a
          href={feedbackHref}
          className="inline-block text-xs text-accent-gold hover:underline"
        >
          Give feedback
        </a>
        <footer className="mt-4 flex justify-end border-t border-charcoal-600 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-charcoal-600 bg-charcoal-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-charcoal-700"
          >
            Close
          </button>
        </footer>
      </div>
    </>
  )
}
