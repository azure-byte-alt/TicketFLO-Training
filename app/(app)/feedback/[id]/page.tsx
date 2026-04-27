import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ScoreCard, { getScoreColor } from '@/components/ScoreCard'

function ScoreDimension({ label, score, max = 25 }: { label: string; score: number; max?: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? '#0e7c5b' : pct >= 60 ? '#b45309' : '#c0392b'
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{score}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function getTicketNumber(id: string): string {
  return 'TKT-' + id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export default async function FeedbackDetailPage({ params }: { params: { id: string } }) {
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
        scenarios ( id, title )
      )
    `)
    .eq('id', params.id)
    .eq('submissions.user_id', userInfo.id)
    .single()

  if (!feedback) notFound()

  const submission = Array.isArray(feedback.submissions) ? feedback.submissions[0] : feedback.submissions
  const scenario = submission && (Array.isArray((submission as any).scenarios) ? (submission as any).scenarios[0] : (submission as any).scenarios)
  const scoreColors = getScoreColor(feedback.score)
  const ticketNumber = submission?.id ? getTicketNumber(submission.id) : '—'

  const gradeLabel = feedback.score_label ||
    (feedback.score >= 90 ? 'Excellent' : feedback.score >= 80 ? 'Good' : feedback.score >= 60 ? 'Needs Improvement' : 'Poor')

  return (
    <div className="p-7 max-w-4xl">

      {/* Back link */}
      <Link href="/feedback" className="text-[13px] text-emerald-700 hover:underline flex items-center gap-1 mb-6 no-underline">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Feedback History
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
              {scenario?.title || submission?.subject_line || 'Ticket Feedback'}
            </h1>
            <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {ticketNumber}
            </span>
          </div>
          <p className="text-[13px] text-gray-500">
            Submitted {new Date(feedback.created_at).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
        {scenario?.id && (
          <Link
            href={`/practice`}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] font-medium hover:bg-gray-50 transition whitespace-nowrap no-underline"
          >
            Try Again
          </Link>
        )}
      </div>

      {/* Score + Coach Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className={`rounded-xl p-6 flex flex-col items-center justify-center border ${scoreColors.border} ${scoreColors.bg}`}>
          <ScoreCard score={feedback.score} size="lg" />
          <div className={`mt-3 text-[13px] font-semibold ${scoreColors.text}`}>{gradeLabel}</div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-4">Coach Summary</h2>
          <div className="space-y-3 mb-4">
            <ScoreDimension label="Overall Quality" score={Math.round(feedback.score / 4)} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">Strength</div>
              <p className="text-[12px] text-gray-700 leading-relaxed">{feedback.strength || 'No strength noted.'}</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1.5">Improvement</div>
              <p className="text-[12px] text-gray-700 leading-relaxed">{feedback.improvement || 'No improvement noted.'}</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-100 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-1.5">Critical Miss</div>
              <p className="text-[12px] text-gray-700 leading-relaxed">{feedback.critical_miss || 'No critical misses.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Feedback — light */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Overall Feedback</h2>
        <p className="text-[13px] text-gray-700 leading-relaxed">{feedback.coach_note || 'No coach note available yet.'}</p>
      </div>

      {/* Strengths + Areas to Improve */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="#0e7c5b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Strengths
          </h2>
          {!feedback.strength ? (
            <p className="text-gray-400 text-[13px]">No specific strengths noted.</p>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5L8.5 2" stroke="#0e7c5b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-[13px] text-gray-700 leading-snug">{feedback.strength}</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 5v3M7 9.5v.5" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Areas to Improve
          </h2>
          {!feedback.improvement && !feedback.critical_miss ? (
            <p className="text-gray-400 text-[13px]">No improvements needed — great ticket!</p>
          ) : (
            <ul className="space-y-3">
              {[feedback.improvement, feedback.critical_miss].filter(Boolean).map((note, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 3v3M5 7.5v.5" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-snug">{note}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Submitted Ticket */}
      <details className="bg-white border border-gray-100 rounded-xl mb-4 group">
        <summary className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl transition">
          <div className="flex items-center gap-3">
            <h2 className="text-[13px] font-semibold text-gray-900">Your Submitted Ticket</h2>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">{ticketNumber}</span>
          </div>
          <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</span>
              <p className="text-[13px] text-gray-800 mt-1">{submission?.category}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</span>
              <p className="text-[13px] text-gray-800 mt-1">{submission?.priority}</p>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</span>
            <p className="text-[13px] text-gray-800 mt-1">{submission?.subject_line}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</span>
            <p className="text-[13px] text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{submission?.description}</p>
          </div>
          {submission?.handoff_note && (
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Steps to Reproduce</span>
              <p className="text-[12px] text-gray-800 mt-1 font-mono leading-relaxed whitespace-pre-wrap">{submission.handoff_note}</p>
            </div>
          )}
        </div>
      </details>

      {feedback.model_used && (
        <div className="text-[11px] text-gray-400">Evaluated by {feedback.model_used}</div>
      )}
    </div>
  )
}
