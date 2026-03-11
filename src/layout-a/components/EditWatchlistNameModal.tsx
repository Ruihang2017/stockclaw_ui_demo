import { useEffect, useRef, useState } from 'react'

interface EditWatchlistNameModalProps {
  isOpen: boolean
  onClose: () => void
  watchlistId: string
  currentName: string
  onSave: (id: string, newName: string) => void
}

export function EditWatchlistNameModal({
  isOpen,
  onClose,
  watchlistId,
  currentName,
  onSave,
}: EditWatchlistNameModalProps) {
  const [value, setValue] = useState(currentName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setValue(currentName)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen, currentName])

  if (!isOpen) return null

  const trimmed = value.trim()
  const handleSave = () => {
    if (!trimmed) return
    onSave(watchlistId, trimmed)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60"
        aria-hidden
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded border border-charcoal-600 bg-charcoal-900 p-4 shadow-panel">
        <h2 className="mb-3 text-sm font-medium text-gray-200">Edit watchlist name</h2>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          aria-label="Watchlist name"
          className="mb-4 w-full rounded border border-charcoal-600 bg-charcoal-800 px-2 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-charcoal-500 focus:outline-none"
          placeholder="Watchlist name"
        />
        <footer className="flex justify-end gap-2 border-t border-charcoal-600 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-charcoal-600 bg-charcoal-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-charcoal-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!trimmed}
            className="rounded border border-charcoal-600 bg-charcoal-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-charcoal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </footer>
      </div>
    </>
  )
}
