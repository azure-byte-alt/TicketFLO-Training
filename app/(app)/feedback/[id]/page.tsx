import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ScoreCard, { getScoreColor } from '@/components/ScoreCard'

function ScoreDimension({ label, score, max = 25 }: { label: string; score: number; max?: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{score}/{max}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default async function FeedbackDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const token = getToken()
  if (!token) notFound()
  const userInfo = decodeToken(token)
  if (!userInfo) notFound()

  const { data: feedback } = await supabase
    .from('feedback')
    .select(`
      *,
      submissions!inner (
        id,
        subject_line,
        category,
        priority,
        description,
        handoff_note,
        scenario_id,
        scenarios (
          id,
          title
        )
      )
    `)
    .eq('id', params.id)
    .eq('submissions.user_id', userInfo.id)
    .single()

  if (!feedback) notFound()

  const submission = Array.isArray(feedback.submissions) ? feedback.submissions[0] : feedback.submissions
  const scenario = submission && (Array.isArray((submission as any).scenarios) ? (submission as any).scenarios[0] : (submission as any).scenarios)
  const scoreColors = getScoreColor(feedback.score)

  const gradeLabel =
    feedback.score_label ||
    (feedback.score >= 90 ? 'Excellent' :
    feedback.score >= 80 ? 'Good' :
    feedback.score >= 60 ? 'Needs Improvement' :
    'Poor')

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/feedback" className="text-sm text-[#4db8a4] hover:underline flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Feedback History
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">
            {scenario?.title || submission?.subject_line || 'Ticket Feedback'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Submitted {new Date(feedback.created_at).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
        {scenario?.id && (
          <Link
            href={`/practice/${scenario.id}`}
            className="px-4 py-2 border border-[#1a2744] text-[#1a2744] rounded-lg text-sm font-medium hover:bg-[#1a2744] hover:text-white transition whitespace-nowrap"
          >
            Try Again
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`rounded-xl p-6 flex flex-col items-center justify-center border ${scoreColors.border} ${scoreColors.bg}`}>
          <ScoreCard score={feedback.score} size="lg" />
          <div className={`mt-3 text-sm font-semibold ${scoreColors.text}`}>{gradeLabel}</div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1a2744] mb-5">Coach Summary</h2>
          <div className="space-y-4">
            <ScoreDimension label="Overall Quality" score={Math.round(feedback.score / 4)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg bg-green-50 border border-green-100 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-green-700">Strength</div>
                <p className="text-gray-700 mt-2">{feedback.strength || 'No strength note recorded.'}</p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">Improvement</div>
                <p className="text-gray-700 mt-2">{feedback.improvement || 'No improvement note recorded.'}</p>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-red-700">Critical Miss</div>
                <p className="text-gray-700 mt-2">{feedback.critical_miss || 'No critical misses noted.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a2744] text-white rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-[#4db8a4] mb-2">Overall Feedback</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{feedback.coach_note || 'No coach note available yet.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1a2744] mb-4 flex items-center gap-2">
            <span className="text-green-500">âœ“</span> Strengths
          </h2>
          {!feedback.strength ? (
            <p className="text-gray-400 text-sm">No specific strengths noted.</p>
          ) : (
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 leading-snug">{feedback.strength}</span>
              </li>
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1a2744] mb-4 flex items-center gap-2">
            <span className="text-amber-500">âš </span> Areas to Improve
          </h2>
          {!feedback.improvement && !feedback.critical_miss ? (
            <p className="text-gray-400 text-sm">No improvements needed â€” great ticket!</p>
          ) : (
            <ul className="space-y-3">
              {[feedback.improvement, feedback.critical_miss].filter(Boolean).map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 leading-snug">{note}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 group">
        <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl transition">
          <h2 className="font-semibold text-[#1a2744]">Your Submitted Ticket</h2>
          <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-6 pb-6 border-t border-gray-50 pt-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Category</span>
              <p className="text-gray-800 mt-1">{submission?.category}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Priority</span>
              <p className="text-gray-800 mt-1">{submission?.priority}</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Title</span>
            <p className="text-gray-800 mt-1">{submission?.subject_line}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Description</span>
            <p className="text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{submission?.description}</p>
          </div>
          {submission?.handoff_note && (
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Steps to Reproduce</span>
              <p className="text-gray-800 mt-1 font-mono text-xs leading-relaxed whitespace-pre-wrap">{submission.handoff_note}</p>
            </div>
          )}
        </div>
      </details>

      {feedback.model_used && (
        <div className="mt-6 text-xs text-gray-400">
          Evaluated by {feedback.model_used}
        </div>
      )}
    </div>
  )
}
