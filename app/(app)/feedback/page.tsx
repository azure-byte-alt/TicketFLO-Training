import { createClient, getToken, decodeToken } from '@/lib/supabase/server'

export default async function FeedbackPage() {
  const token = getToken()
  if (!token) return null
  const userInfo = decodeToken(token)
  if (!userInfo) return null

  const supabase = createClient()

  const { data: feedbackList } = await supabase
    .from('feedback')
    .select(`
      score,
      created_at,
      submissions!inner (
        user_id
      )
    `)
    .eq('submissions.user_id', userInfo.id)
    .order('created_at', { ascending: false })

  if (!feedbackList || feedbackList.length === 0) {
    return (
      <div className="grid gap-4">
        <p className="text-slate-400 text-sm">No feedback yet. Complete a practice ticket to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {feedbackList.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-md p-5 border border-slate-100 hover:shadow-xl transition"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-slate-700 text-lg">
                Ticket Feedback
              </h3>
              <p className="text-sm text-slate-400">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full font-bold text-white ${
                item.score >= 80
                  ? 'bg-green-500'
                  : item.score >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            >
              {item.score}%
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  item.score >= 80
                    ? 'bg-green-500'
                    : item.score >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
