import { NextRequest, NextResponse } from 'next/server'
import { createClient, getToken } from '@/lib/supabase/server'
import { evaluateTicket } from '@/lib/anthropic'

function getScoreLabel(score: number) {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs Improvement'
  return 'Poor'
}

export async function POST(request: NextRequest) {
  const token = getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    scenarioId?: string
    title?: string
    category?: string
    priority?: string
    description?: string
    steps?: string
    scenarioContext?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { scenarioId, title, category, priority, description, steps = '', scenarioContext = '' } = body

  if (!title?.trim() || !category || !priority || !description?.trim()) {
    return NextResponse.json(
      { error: 'Missing required fields: title, category, priority, description' },
      { status: 400 }
    )
  }

  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .insert({
      user_id: user.id,
      scenario_id: scenarioId ?? null,
      subject_line: title.trim(),
      category,
      priority,
      description: description.trim(),
      handoff_note: steps.trim() || null,
      attempt_number: 1,
    })
    .select('id')
    .single()

  if (submissionError || !submission) {
    console.error('Submission insert error:', submissionError)
    return NextResponse.json(
      { error: submissionError?.message || 'Failed to save ticket' },
      { status: 500 }
    )
  }

  let evaluation
  try {
    evaluation = await evaluateTicket({
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
      steps: steps.trim(),
      scenarioContext,
    })
  } catch (err) {
    console.error('Claude evaluation error:', err)
    await supabase.from('submissions').delete().eq('id', submission.id)
    return NextResponse.json({ error: 'AI evaluation failed. Please try again.' }, { status: 500 })
  }

  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .insert({
      submission_id: submission.id,
      score: evaluation.total_score,
      score_label: getScoreLabel(evaluation.total_score),
      strength: evaluation.strengths[0] ?? 'Clear effort shown in the submission.',
      improvement: evaluation.improvements[0] ?? 'Keep refining specificity and business impact.',
      critical_miss: evaluation.improvements[1] ?? null,
      coach_note: evaluation.overall_feedback,
      model_used: 'claude-sonnet-4-6',
    })
    .select('id')
    .single()

  if (feedbackError || !feedback) {
    console.error('Feedback insert error:', feedbackError)
    return NextResponse.json(
      { error: feedbackError?.message || 'Failed to save feedback' },
      { status: 500 }
    )
  }

  return NextResponse.json({ feedbackId: feedback.id })
}
