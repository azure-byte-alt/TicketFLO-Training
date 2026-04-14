import Anthropic from '@anthropic-ai/sdk'
import { EvaluationResult } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are an expert IT help desk trainer evaluating ticket quality. Score the ticket on 4 dimensions (0-25 each):
1. Title Quality: specific, descriptive, mentions system/app, summarizes issue
2. Description Quality: clear, professional, includes when/who/impact, no vague language
3. Steps to Reproduce: numbered, sequential, includes expected vs actual, verbatim errors
4. Priority/Category Accuracy: appropriate for the described scenario

Return ONLY valid JSON (no markdown):
{
  "total_score": number,
  "title_score": number,
  "description_score": number,
  "steps_score": number,
  "priority_category_score": number,
  "strengths": ["string", ...],
  "improvements": ["string", ...],
  "overall_feedback": "string",
  "ideal_title": "string",
  "ideal_description": "string",
  "ideal_steps": "string"
}`

export async function evaluateTicket(params: {
  title: string
  category: string
  priority: string
  description: string
  steps: string
  scenarioContext: string
}): Promise<EvaluationResult> {
  const userMessage = `Scenario Context: ${params.scenarioContext}

Submitted Ticket:
Title: ${params.title}
Category: ${params.category}
Priority: ${params.priority}
Description: ${params.description}
Steps to Reproduce: ${params.steps || 'None provided'}

Please evaluate this ticket and return JSON only.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let parsed: EvaluationResult
  try {
    // Strip any markdown code blocks if present
    const text = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Failed to parse Claude response as JSON')
  }

  return parsed
}
