interface TopNavProps {
  title: string
  subtitle?: string
}

export default function TopNav({ title, subtitle }: TopNavProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div>
        <h1 className="text-xl font-bold text-[#1a2744]">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </header>
  )
}
