import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
}

export default function SearchBar({ placeholder = '搜索存档...', onSearch, debounceMs = 300 }: SearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(value), debounceMs)
    return () => clearTimeout(timerRef.current)
  }, [value, debounceMs, onSearch])

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-surface-200 py-2 pl-9 pr-4 text-sm text-surface-700 placeholder-surface-400 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
      />
      {value && (
        <button
          onClick={() => { setValue(''); onSearch('') }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
        >
          ×
        </button>
      )}
    </div>
  )
}
