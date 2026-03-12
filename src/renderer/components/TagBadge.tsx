const tagColors: Record<string, string> = {
  '重要': 'bg-red-50 text-red-600 border-red-200',
  '里程碑': 'bg-blue-50 text-blue-600 border-blue-200',
  '备份': 'bg-green-50 text-green-600 border-green-200',
  '功能': 'bg-purple-50 text-purple-600 border-purple-200',
  '修复': 'bg-amber-50 text-amber-600 border-amber-200',
}

const defaultColor = 'bg-surface-50 text-surface-600 border-surface-200'

interface TagBadgeProps {
  tag: string
  onRemove?: (tag: string) => void
}

export default function TagBadge({ tag, onRemove }: TagBadgeProps) {
  const color = tagColors[tag] ?? defaultColor

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${color}`}>
      {tag}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(tag) }}
          className="ml-0.5 hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  )
}
