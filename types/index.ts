export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Scenario {
  id: string
  scenario_number?: number | null
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  caller_name?: string | null
  department?: string | null
  situation_text?: string | null
  error_message?: string | null
  urgency_note?: string | null
  correct_priority?: string | null
  correct_category?: string | null
  tier?: number | null
  is_active?: boolean | null
  ideal_title?: string | null
  ideal_description?: string | null
  ideal_steps?: string | null
  ideal_priority?: string | null
  ideal_category?: string | null
  created_at: string
}

export interface Ticket {
  id: string
  user_id: string
  scenario_id: string | null
  title: string
  category: string
  priority: string
  description: string
  steps_to_reproduce: string | null
  submitted_at: string
}

export interface Feedback {
  id: string
  ticket_id: string
  user_id: string
  total_score: number
  title_score: number
  description_score: number
  steps_score: number
  priority_category_score: number
  strengths: string[]
  improvements: string[]
  overall_feedback: string
  ideal_title: string | null
  ideal_description: string | null
  ideal_steps: string | null
  created_at: string
}

export interface FeedbackWithTicket extends Feedback {
  tickets: Ticket & {
    scenarios: Scenario | null
  }
}

export interface EvaluationResult {
  total_score: number
  title_score: number
  description_score: number
  steps_score: number
  priority_category_score: number
  strengths: string[]
  improvements: string[]
  overall_feedback: string
  ideal_title: string
  ideal_description: string
  ideal_steps: string
}
