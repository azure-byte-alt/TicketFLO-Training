import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PracticeForm from './PracticeForm'

export default async function PracticeSessionPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!scenario) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  return <PracticeForm scenario={scenario} userId={user.id} />
}
