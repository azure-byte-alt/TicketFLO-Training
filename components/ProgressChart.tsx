'use client'

interface DataPoint {
  date: string
  score: number
}

interface ProgressChartProps {
  data: DataPoint[]
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data yet. Complete some practice sessions!
      </div>
    )
  }

  const width = 600
  const height = 200
  const padding = { top: 20, right: 20, bottom: 40, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxScore = 100
  const minScore = 0

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: padding.top + chartHeight - ((d.score - minScore) / (maxScore - minScore)) * chartHeight,
    score: d.score,
    date: d.date,
  }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD = [
    `M ${points[0]?.x} ${padding.top + chartHeight}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1]?.x} ${padding.top + chartHeight}`,
    'Z',
  ].join(' ')

  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minWidth: '300px' }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4db8a4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4db8a4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = padding.top + chartHeight - (tick / maxScore) * chartHeight
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={tick === 0 ? undefined : '4 4'}
              />
              <text
                x={padding.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#9ca3af"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Area */}
        {points.length > 1 && (
          <path d={areaD} fill="url(#areaGradient)" />
        )}

        {/* Line */}
        {points.length > 1 && (
          <path
            d={pathD}
            fill="none"
            stroke="#4db8a4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#4db8a4" strokeWidth="2.5" />
            <title>{`Score: ${p.score} | ${p.date}`}</title>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => {
          if (data.length <= 6 || i % Math.ceil(data.length / 6) === 0) {
            return (
              <text
                key={i}
                x={p.x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
              >
                {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            )
          }
          return null
        })}
      </svg>
    </div>
  )
}
