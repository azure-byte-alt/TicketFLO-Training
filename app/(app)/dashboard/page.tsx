import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Fetch user stats from database
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalTickets = submissions?.length || 2
  const scores = submissions?.map(s => s.score) || [18, 52]
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 35
  const bestScore = scores.length > 0 ? Math.max(...scores) : 52
  const currentStreak = 0 // Calculate based on consecutive days
  const certProgress = Math.min(Math.round((totalTickets / 15) * 100), 100)

  const recentSubmissions = submissions?.slice(0, 2) || [
    { id: 1, scenario_title: 'Password reset — new hire', score: 18, created_at: '2026-04-25' },
    { id: 2, scenario_title: 'Printer offline — HR floor', score: 52, created_at: '2026-04-18' }
  ]

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-rose-100 text-rose-700 border-rose-200'
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.email?.split('@')[0] || 
                    'Support Pro'

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const TIPS = [
    'Always include the affected system or application name in the ticket title.',
    'Specify when the issue started — exact time and date helps IT prioritize.',
    'Number your reproduction steps for clarity and consistency.',
    'Include error messages verbatim — exact text helps find solutions faster.',
    'Mention how many users are affected — one person or the whole department?',
    'Note any recent changes: updates, new software, configuration changes.',
  ]

  const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-slate-600 text-lg mb-4">{currentDate}</p>
          <p className="text-slate-500 italic text-sm">
            Every strong ticket builds career confidence.
          </p>

          {/* Certification Progress Bar */}
          <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Certification Progress</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {totalTickets} of 15 practice tickets completed
                </p>
              </div>
              <span className="text-2xl font-bold text-teal-600">{certProgress}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${certProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Tickets */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Total Tickets</p>
            <p className="text-4xl font-bold text-slate-900">{totalTickets}</p>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Average Score</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-slate-900">{averageScore}</p>
              <p className="text-lg text-slate-400 font-medium">/100</p>
            </div>
          </div>

          {/* Best Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                bestScore >= 80 ? 'bg-emerald-50' : 
                bestScore >= 60 ? 'bg-amber-50' : 'bg-rose-50'
              }`}>
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Best Score</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-4xl font-bold ${
                bestScore >= 80 ? 'text-emerald-600' : 
                bestScore >= 60 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {bestScore}
              </p>
              <p className="text-lg text-slate-400 font-medium">/100</p>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                currentStreak > 0 ? 'bg-orange-50' : 'bg-slate-50'
              }`}>
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Current Streak</p>
            {currentStreak > 0 ? (
              <>
                <p className="text-4xl font-bold text-orange-600">{currentStreak}</p>
                <p className="text-xs text-slate-500 mt-1">Day Momentum Streak 🔥</p>
              </>
            ) : (
              <p className="text-lg font-semibold text-slate-400 mt-2">
                Start Your Streak Today
              </p>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Recent Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Submissions</h2>
              
              <div className="space-y-4">
                {recentSubmissions.map((submission: any) => (
                  <div 
                    key={submission.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-150"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {submission.scenario_title || submission.title || 'Practice Ticket'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {new Date(submission.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getScoreBadgeColor(submission.score)}`}>
                        {submission.score}/100
                      </span>
                      <Link 
                        href={`/feedback/${submission.id}`}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <Link 
                href="/feedback"
                className="mt-6 text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-2 transition-colors"
              >
                View all feedback →
              </Link>
            </div>

            {/* Start Practice CTA */}
            <div className="mt-6">
              <Link
                href="/practice"
                className="block w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-5 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg text-center"
              >
                ✏️ Start Practice Session
              </Link>
            </div>
          </div>

          {/* Right Column - Tip & Growth Center */}
          <div className="space-y-6">
            
            {/* Tip of the Day */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💡</span>
                <h3 className="font-bold text-lg">Tip of the Day</h3>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {randomTip}
              </p>
            </div>

            {/* Growth Center */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Growth Center</h3>
              
              <div className="space-y-3">
                <Link
                  href="/practice"
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 transition-all duration-150 group"
                >
                  <span className="text-xl">✏️</span>
                  <span className="font-medium text-slate-700 group-hover:text-teal-700">
                    New Practice Session
                  </span>
                </Link>

                <Link
                  href="/practice?continue=true"
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 transition-all duration-150 group"
                >
                  <span className="text-xl">▶️</span>
                  <span className="font-medium text-slate-700 group-hover:text-teal-700">
                    Continue Last Scenario
                  </span>
                </Link>

                <Link
                  href="/progress"
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 transition-all duration-150 group"
                >
                  <span className="text-xl">📈</span>
                  <span className="font-medium text-slate-700 group-hover:text-teal-700">
                    Improve Weak Area
                  </span>
                </Link>

                <Link
                  href="/certificate"
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 transition-all duration-150 group"
                >
                  <span className="text-xl">🏅</span>
                  <span className="font-medium text-slate-700 group-hover:text-teal-700">
                    View Certificate Progress
                  </span>
                </Link>
              </div>
            </div>

            {/* Review Learning Button */}
            <Link
              href="/learn"
              className="block w-full border-2 border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-center"
            >
              📚 Review Learning
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
