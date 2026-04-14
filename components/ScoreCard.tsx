interface ScoreCardProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function getScoreColor(score: number) {
  if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', ring: 'stroke-green-500' }
  if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', ring: 'stroke-yellow-500' }
  return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', ring: 'stroke-red-500' }
}

export function ScoreBadge({ score }: { score: number }) {
  const colors = getScoreColor(score)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
      {score}/100
    </span>
  )
}

export default function ScoreCard({ score, size = 'md', showLabel = true }: ScoreCardProps) {
  const colors = getScoreColor(score)
  const radius = size === 'lg' ? 54 : size === 'md' ? 40 : 28
  const strokeWidth = size === 'lg' ? 8 : 6
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const svgSize = (radius + strokeWidth) * 2 + 4
  const center = svgSize / 2

  const textSize = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className={colors.ring}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSize} font-bold ${colors.text}`}>{score}</span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 font-medium">out of 100</span>
      )}
    </div>
  )
}
