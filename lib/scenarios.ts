export type ScenarioRow = {
  id: string
  title: string
  scenario_number: number | null
  caller_name: string | null
  department: string | null
  situation_text: string | null
  error_message: string | null
  urgency_note: string | null
  correct_priority: string | null
  correct_category: string | null
  tier: number | null
  is_active: boolean | null
  created_at: string
}

export type ScenarioView = {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
}

export function getDifficultyFromTier(tier: number | null | undefined): ScenarioView['difficulty'] {
  if ((tier ?? 1) >= 3) return 'advanced'
  if ((tier ?? 1) === 2) return 'intermediate'
  return 'beginner'
}

export function buildScenarioDescription(row: Partial<ScenarioRow>) {
  const details = [
    row.situation_text?.trim(),
    row.error_message ? `Error message: ${row.error_message.trim()}` : null,
    row.urgency_note ? `Urgency: ${row.urgency_note.trim()}` : null,
    row.caller_name ? `Caller: ${row.caller_name.trim()}` : null,
    row.department ? `Department: ${row.department.trim()}` : null,
  ].filter(Boolean)

  return details.join('\n\n')
}

export function normalizeScenario(row: Partial<ScenarioRow>): ScenarioView {
  return {
    id: row.id ?? '',
    title: row.title ?? 'Untitled Scenario',
    description: buildScenarioDescription(row),
    category: row.correct_category ?? 'Other',
    difficulty: getDifficultyFromTier(row.tier),
    created_at: row.created_at ?? new Date(0).toISOString(),
  }
}
