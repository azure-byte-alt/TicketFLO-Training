'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scenario } from '@/types'

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Account Access', 'Performance', 'Other']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const TIPS: Record<string, string[]> = {
  title: [
    'Include the system or app name (e.g., "Outlook", "VPN", "Dell XPS")',
    'Describe the problem, not the desired solution',
    'Mention who is affected: one user, a team, or everyone',
    'Keep under 80 characters when possible',
  ],
  description: [
    'State what happened, when it started, and who is affected',
    'Include business impact — is work blocked?',
    'Mention the OS, browser, or app version when relevant',
    'Avoid vague language like "it doesn\'t work"',
  ],
  steps: [
    'Number each step — one action per step',
    'Include the exact error message verbatim',
    'State expected vs. actual behavior',
    'Note if the issue is consistent or intermittent',
  ],
  priority: [
    'Critical: system down, security breach, whole dept blocked',
    'High: major impact, no workaround available',
    'Medium: workaround exists, productivity affected',
    'Low: minor issue, cosmetic, or future request',
  ],
}

interface Props {
  scenario: Scenario
  userId: string
}

export default function PracticeForm({ scenario }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    category: '',
    priority: '',
    description: '',
    steps: '',
  })
  const [activeTip, setActiveTip] = useState<keyof typeof TIPS>('title')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.category || !form.priority || !form.description.trim()) {
      setError('Please fill in all required fields: Title, Category, Priority, and Description.')
      return
    }
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          title: form.title,
          category: form.category,
          priority: form.priority,
          description: form.description,
          steps: form.steps,
          scenarioContext: scenario.description,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      router.push(`/feedback/${data.feedbackId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const difficultyColor: Record<string, string> = {
    beginner: 'text-green-600 bg-green-50 border-green-200',
    intermediate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    advanced: 'text-red-600 bg-red-50 border-red-200',
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/practice" className="text-sm text-[#4db8a4] hover:underline flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Scenarios
        </Link>
        <h1 className="text-2xl font-bold text-[#1a2744]">Practice Session</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-4">
          {/* Scenario Card */}
          <div className="bg-[#1a2744] rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#4db8a4] text-xs font-semibold uppercase tracking-widest">Scenario</span>
              <span
                className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full border ${
                  difficultyColor[scenario.difficulty] ?? 'text-gray-500 bg-gray-50 border-gray-200'
                }`}
              >
                {scenario.difficulty}
              </span>
            </div>
            <h2 className="font-semibold text-lg mb-2">{scenario.title}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{scenario.description}</p>
          </div>

          {/* Ticket Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h3 className="font-semibold text-[#1a2744] text-base border-b border-gray-100 pb-3">
              Write Your Ticket
            </h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onFocus={() => setActiveTip('title')}
                placeholder="Brief, specific summary of the issue"
                maxLength={120}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent transition"
              />
              <div className="text-xs text-gray-400 text-right mt-1">{form.title.length}/120</div>
            </div>

            {/* Category + Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  onFocus={() => setActiveTip('priority')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent transition bg-white"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  onFocus={() => setActiveTip('priority')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent transition bg-white"
                >
                  <option value="">Select priority</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onFocus={() => setActiveTip('description')}
                placeholder="Describe the issue clearly: what happened, when, who is affected, and the business impact..."
                rows={5}
                maxLength={2000}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent transition resize-none"
              />
              <div className="text-xs text-gray-400 text-right mt-1">{form.description.length}/2000</div>
            </div>

            {/* Steps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Steps to Reproduce
                <span className="ml-1 text-xs text-gray-400 font-normal">(optional but recommended)</span>
              </label>
              <textarea
                value={form.steps}
                onChange={(e) => handleChange('steps', e.target.value)}
                onFocus={() => setActiveTip('steps')}
                placeholder="1. Open application&#10;2. Navigate to...&#10;3. Click...&#10;4. Observe error: &quot;exact error text&quot;"
                rows={4}
                maxLength={1500}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent transition resize-none font-mono"
              />
              <div className="text-xs text-gray-400 text-right mt-1">{form.steps.length}/1500</div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#4db8a4] hover:bg-[#3da898] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Evaluating with AI...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Ticket for Feedback
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tips Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#4db8a4]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4db8a4]">
                <span>AI Coach</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Real-time guidance while you draft your ticket.
              </p>
            </div>
            <h3 className="font-semibold text-[#1a2744] mb-4 flex items-center gap-2">
              <span className="text-[#4db8a4]">💡</span> Writing Tips
            </h3>
            <div className="flex gap-1 mb-4 flex-wrap">
              {(['title', 'description', 'steps', 'priority'] as const).map((tip) => (
                <button
                  key={tip}
                  onClick={() => setActiveTip(tip)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                    activeTip === tip
                      ? 'bg-[#4db8a4] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tip}
                </button>
              ))}
            </div>
            <ul className="space-y-2">
              {TIPS[activeTip].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                  <span className="text-[#4db8a4] mt-0.5 flex-shrink-0">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-2 text-sm">Scoring Criteria</h4>
            <ul className="space-y-2 text-xs text-amber-700">
              <li className="flex justify-between">
                <span>Title Quality</span>
                <span className="font-semibold">0–25 pts</span>
              </li>
              <li className="flex justify-between">
                <span>Description Quality</span>
                <span className="font-semibold">0–25 pts</span>
              </li>
              <li className="flex justify-between">
                <span>Steps to Reproduce</span>
                <span className="font-semibold">0–25 pts</span>
              </li>
              <li className="flex justify-between">
                <span>Priority/Category</span>
                <span className="font-semibold">0–25 pts</span>
              </li>
              <li className="flex justify-between border-t border-amber-200 pt-2 font-semibold">
                <span>Total</span>
                <span>0–100 pts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
