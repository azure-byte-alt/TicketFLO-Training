import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PracticeForm from './PracticeForm'
import { normalizeScenario } from '@/lib/scenarios'

export default async function PracticeSessionPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('id, title, scenario_number, caller_name, department, situation_text, error_message, urgency_note, correct_priority, correct_category, tier, is_active, created_at')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!scenario) notFound()

  const token = getToken()
  if (!token) notFound()
  const userInfo = decodeToken(token)
  if (!userInfo) notFound()

  return <PracticeForm scenario={normalizeScenario(scenario)} userId={userInfo.id} />
}
