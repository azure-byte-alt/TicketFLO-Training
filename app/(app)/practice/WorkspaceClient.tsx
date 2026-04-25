'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario } from '@/types'

const priorityColors: Record<string, { bg: string; text: string }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-700' },
  High: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Low: { bg: 'bg-green-100', text: 'text-green-700' },
}

const categoryColors: Record<string, string> = {
  'Authentication / Access': 'bg-purple-100 text-purple-700',
  Hardware: 'bg-gray-100 text-gray-700',
  'Software / Apps': 'bg-blue-100 text-blue-700',
  'Network / VPN': 'bg-cyan-100 text-cyan-700',
  Security: 'bg-red-100 text-red-700',
  Performance: 'bg-orange-100 text-orange-700',
}

function getPriority(scenario: Scenario): string {
  const p = scenario.correct_priority?.toLowerCase() || ''
  if (p.includes('critical')) return 'Critical'
  if (p.includes('high')) return 'High'
  if (p.includes('low')) return 'Low'
  return 'Medium'
}

// ── Live AI Coach logic ────────────────────────────────────────────────────────
function getCoachMessages(ticket: {
  title: string
  priority: string
  category: string
  description: string
  probing: string
  steps: string
  impact: string
}, step: 'probe' | 'write') {
  const messages: { type: 'tip' | 'warning' | 'success'; text: string }[] = []

  if (step === 'probe') {
    messages.push({ type: 'tip', text: 'Select every question you would ask a real caller. The more complete your probing, the stronger your ticket will be.' })
    messages.push({ type: 'tip', text: 'Always ask "What changed recently?" — a password reset, Windows update, or new hardware explains most Tier 1 issues.' })
    messages.push({ type: 'warning', text: 'Don\'t skip "How many users are affected?" — scope determines priority.' })
    return messages
  }

  // Title feedback
  if (ticket.title.length === 0) {
    messages.push({ type: 'warning', text: 'Start with the ticket title. It should include WHO is affected + WHAT the issue is.' })
  } else if (ticket.title.length < 15) {
    messages.push({ type: 'warning', text: 'Your title is too short. Add more detail — who is affected and what exactly is wrong?' })
  } else if (!ticket.title.match(/\s/)) {
    messages.push({ type: 'warning', text: 'Your title looks like one word. A strong title describes the full situation.' })
  } else if (ticket.title.length >= 15) {
    messages.push({ type: 'success', text: 'Good title length! Make sure it includes the location or system involved.' })
  }

  // Priority feedback
  if (ticket.priority === '') {
    messages.push({ type: 'warning', text: 'Priority is required. Base it on business impact — not how upset the caller sounds.' })
  } else if (ticket.priority === 'Critical') {
    messages.push({ type: 'tip', text: 'Critical means multiple users cannot work or there is a security breach. Confirm this matches the scenario.' })
  } else if (ticket.priority === 'High') {
    messages.push({ type: 'success', text: 'High priority set. Make sure your impact field confirms the user is fully blocked with no workaround.' })
  }

  // Category feedback
  if (ticket.category === '') {
    messages.push({ type: 'warning', text: 'Assign a category — this routes the ticket to the right team.' })
  } else {
    messages.push({ type: 'success', text: `Category set to ${ticket.category}. QA will verify this matches the scenario.` })
  }

  // Description feedback
  if (ticket.description.length === 0) {
    messages.push({ type: 'tip', text: 'Issue description is the heart of the ticket. Document what the user reported, when it started, and error messages verbatim.' })
  } else if (ticket.description.length < 60) {
    messages.push({ type: 'warning', text: 'Description needs more detail. Include the exact error message, when it started, and who is affected.' })
  } else if (ticket.description.length >= 60) {
    messages.push({ type: 'success', text: 'Good description length. Confirm you included a timestamp and the exact error message if there was one.' })
  }

  // Probing details feedback
  if (ticket.probing.length === 0) {
    messages.push({ type: 'tip', text: 'Probing details capture what you gathered from the caller — device type, OS, network, what changed recently.' })
  } else if (ticket.probing.length < 30) {
    messages.push({ type: 'warning', text: 'Add more probing details. What device? What OS? Is only one user affected or multiple?' })
  } else {
    messages.push({ type: 'success', text: 'Probing details look solid. This is what separates a Tier 1 agent from a great one.' })
  }

  // Steps taken feedback
  if (ticket.steps.length === 0) {
    messages.push({ type: 'warning', text: 'Actions taken must be documented — even if nothing was tried. Write: "No steps taken prior to submission."' })
  } else if (ticket.steps.length >= 20) {
    messages.push({ type: 'success', text: 'Actions taken documented. The next technician won\'t repeat your work.' })
  }

  // Impact feedback
  if (ticket.impact.length === 0) {
    messages.push({ type: 'warning', text: 'Business impact is required. Is work completely blocked? Is there a deadline affected? How many users?' })
  } else if (ticket.impact.length >= 10) {
    messages.push({ type: 'success', text: 'Impact documented. This helps QA verify your priority selection is correct.' })
  }

  return messages.slice(0, 4) // Show max 4 at a time
}

export default function WorkspaceClient({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Scenario | null>(scenarios[0] ?? null)
  const [step, setStep] = useState<'probe' | 'write'>('probe')
  const [checkedProbes, setCheckedProbes] = useState<number[]>([])
  const [ticket, setTicket] = useState({
    title: '',
    priority: '',
    category: '',
    description: '',
    probing: '',
    steps: '',
    impact: '',
  })

  const toggleProbe = (i: number) => {
    setCheckedProbes(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  const selectScenario = (s: Scenario) => {
    setSelected(s)
    setStep('probe')
    setCheckedProbes([])
    setTicket({ title: '', priority: '', category: '', description: '', probing: '', steps: '', impact: '' })
  }

  const probeQuestions = selected ? [
    `What exactly is ${selected.caller_name || 'the user'} experiencing?`,
    'When did the issue first start?',
    'Has anything changed recently — updates, new software, password changes?',
    'How many users are affected?',
    'What error message appears, if any?',
    'What device and operating system is the user on?',
    'What troubleshooting has already been attempted?',
    'What is the business impact — is work completely blocked?',
  ] : []

  // QA checklist — synced to the 6 module fields
  const qaChecklist = [
    { label: 'Title — specific & descriptive', done: ticket.title.length > 15, field: 'title' },
    { label: 'Priority assigned correctly', done: ticket.priority !== '', field: 'priority' },
    { label: 'Category assigned', done: ticket.category !== '', field: 'category' },
    { label: 'Issue description complete', done: ticket.description.length > 60, field: 'description' },
    { label: 'Probing details documented', done: ticket.probing.length > 30, field: 'probing' },
    { label: 'Actions taken recorded', done: ticket.steps.length > 20, field: 'steps' },
    { label: 'Business impact noted', done: ticket.impact.length > 10, field: 'impact' },
  ]

  const qaScore = qaChecklist.filter(q => q.done).length
  const qaTotal = qaChecklist.length

  // Live coach messages
  const coachMessages = useMemo(
    () => getCoachMessages(ticket, step),
    [ticket, step]
  )

  const canSubmit = ticket.title.length > 15 &&
    ticket.priority !== '' &&
    ticket.category !== '' &&
    ticket.description.length > 60

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a2744]">Practice Workspace</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Select a ticket from the queue, probe the caller, then build your ticket section by section
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-[#4db8a4] rounded-full animate-pulse"></span>
            AI Coach Active
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Ticket Queue */}
        <div className="w-64 border-r border-gray-100 bg-white flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-[#1a2744]">Ticket Queue</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
              {scenarios.length} open
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            {scenarios.map((s) => {
              const p = getPriority(s)
              const pc = priorityColors[p]
              const isActive = selected?.id === s.id
              return (
                <div
                  key={s.id}
                  onClick={() => selectScenario(s)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#f0fdfa] border-l-2 border-l-[#4db8a4]'
                      : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                  }`}
                >
                  <p className={`text-xs font-semibold mb-1 leading-snug ${isActive ? 'text-[#0f172a]' : 'text-[#334155]'}`}>
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">{s.category}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                    {p}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* CENTER — Workspace */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-5 flex flex-col gap-4">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-3">👈</div>
                <p className="font-medium">Select a ticket from the queue to start</p>
              </div>
            </div>
          ) : (
            <>
              {/* Scenario Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${categoryColors[selected.category] ?? 'bg-slate-100 text-slate-700'}`}>
                        {selected.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        #{selected.scenario_number?.toString().padStart(3, '0') ?? '001'}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#1a2744]">{selected.title}</h2>
                    {selected.caller_name && (
                      <p className="text-sm text-gray-500 mt-1">
                        Caller: <strong>{selected.caller_name}</strong>
                        {selected.department && ` · ${selected.department}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-[#f8fafc] rounded-lg border-l-2 border-[#4db8a4]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">📞 Situation</p>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {selected.situation_text || selected.description}
                  </p>
                  {selected.error_message && (
                    <p className="text-xs text-red-600 mt-2 font-mono bg-red-50 px-2 py-1 rounded">
                      Error: {selected.error_message}
                    </p>
                  )}
                  {selected.urgency_note && (
                    <p className="text-xs text-orange-600 mt-2 font-semibold">⚡ {selected.urgency_note}</p>
                  )}
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-3">
                {(['probe', 'write'] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s
                        ? 'bg-[#4db8a4] text-white'
                        : i < (['probe', 'write'].indexOf(step))
                        ? 'bg-[#1a2744] text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {i < (['probe', 'write'].indexOf(step)) ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${step === s ? 'text-[#1a2744]' : 'text-gray-400'}`}>
                      {s === 'probe' ? 'Probing' : 'Write Ticket'}
                    </span>
                    {i < 1 && <span className="text-gray-300 text-sm mx-1">›</span>}
                  </div>
                ))}
              </div>

              {/* STEP 1: PROBING */}
              {step === 'probe' && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-[#1a2744] mb-1">Step 1 — Probing Questions</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Check every question you would ask this caller before writing the ticket. Strong probing = strong ticket.
                  </p>
                  <div className="flex flex-col gap-2">
                    {probeQuestions.map((q, i) => (
                      <label
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${
                          checkedProbes.includes(i)
                            ? 'border-[#4db8a4] bg-[#f0fdfa] text-[#0f172a]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checkedProbes.includes(i)}
                          onChange={() => toggleProbe(i)}
                          className="mt-0.5 accent-[#4db8a4]"
                        />
                        {q}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {checkedProbes.length} of {probeQuestions.length} questions selected
                    </p>
                    <button
                      onClick={() => setStep('write')}
                      className="bg-[#1a2744] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#243456] transition"
                    >
                      Continue to Ticket Writing →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: WRITE TICKET */}
              {step === 'write' && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-[#1a2744] mb-1">Step 2 — Build the Ticket</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Fill each section completely. The AI Coach on the right is watching and will flag missing details before you submit.
                  </p>

                  <div className="flex flex-col gap-4">

                    {/* Title */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Ticket Title <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs text-gray-400 mt-0.5 mb-1">WHO is affected + WHAT is wrong. Keep under 80 characters.</p>
                      <input
                        value={ticket.title}
                        onChange={e => setTicket({ ...ticket, title: e.target.value })}
                        placeholder="e.g. User Cannot Access Outlook — Password Loop Since 9AM"
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">{ticket.title.length}/80</p>
                    </div>

                    {/* Priority + Category */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Priority <span className="text-red-400">*</span>
                        </label>
                        <p className="text-xs text-gray-400 mt-0.5 mb-1">Based on business impact.</p>
                        <select
                          value={ticket.priority}
                          onChange={e => setTicket({ ...ticket, priority: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] bg-white"
                        >
                          <option value="">Select priority</option>
                          <option>Critical</option>
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Category <span className="text-red-400">*</span>
                        </label>
                        <p className="text-xs text-gray-400 mt-0.5 mb-1">Routes to the right team.</p>
                        <select
                          value={ticket.category}
                          onChange={e => setTicket({ ...ticket, category: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] bg-white"
                        >
                          <option value="">Select category</option>
                          <option>Authentication / Access</option>
                          <option>Hardware</option>
                          <option>Software / Apps</option>
                          <option>Network / VPN</option>
                          <option>Security</option>
                          <option>Performance</option>
                        </select>
                      </div>
                    </div>

                    {/* Issue Description */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Issue Description <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs text-gray-400 mt-0.5 mb-1">What the user reported. Include exact error message verbatim and when it started.</p>
                      <textarea
                        value={ticket.description}
                        onChange={e => setTicket({ ...ticket, description: e.target.value })}
                        placeholder="Describe the issue clearly. Include what the user reported, when it started, exact error message if any."
                        rows={3}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] resize-none"
                      />
                    </div>

                    {/* Probing Details */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Probing Details Gathered
                      </label>
                      <p className="text-xs text-gray-400 mt-0.5 mb-1">What did you learn from the caller? Device, OS, scope, recent changes.</p>
                      <textarea
                        value={ticket.probing}
                        onChange={e => setTicket({ ...ticket, probing: e.target.value })}
                        placeholder="e.g. Windows 11 laptop, company network. Started after password reset this morning. Only this user affected. No recent hardware changes."
                        rows={2}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] resize-none"
                      />
                    </div>

                    {/* Actions Taken */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Actions Taken
                      </label>
                      <p className="text-xs text-gray-400 mt-0.5 mb-1">Every step you performed, in order. If none, write: "No steps taken prior to submission."</p>
                      <textarea
                        value={ticket.steps}
                        onChange={e => setTicket({ ...ticket, steps: e.target.value })}
                        placeholder="e.g. Cleared credentials in Credential Manager. Restarted Outlook — issue persisted. Verified AD account — active, no flags."
                        rows={2}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] resize-none"
                      />
                    </div>

                    {/* Business Impact */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Business Impact
                      </label>
                      <p className="text-xs text-gray-400 mt-0.5 mb-1">Is work completely blocked? Deadline affected? How many users?</p>
                      <input
                        value={ticket.impact}
                        onChange={e => setTicket({ ...ticket, impact: e.target.value })}
                        placeholder="e.g. User cannot send or receive email — fully blocked from work."
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4]"
                      />
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setStep('probe')}
                      className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => router.push(`/practice/${selected.id}`)}
                      disabled={!canSubmit}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                        canSubmit
                          ? 'bg-[#4db8a4] hover:bg-[#3da898] text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canSubmit ? 'Submit for AI Scoring →' : 'Complete required fields to submit'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT — AI Coach Panel */}
        <div className="w-72 border-l border-gray-100 bg-white flex flex-col flex-shrink-0 overflow-y-auto">

          {/* Coach Header */}
          <div className="px-4 py-3 bg-[#1a2744] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4db8a4] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              AI
            </div>
            <div>
              <p className="text-white text-sm font-bold">AI Coach</p>
              <p className="text-[#4db8a4] text-xs">
                {step === 'probe' ? 'Guiding your probing' : 'Reviewing your ticket live'}
              </p>
            </div>
          </div>

          {/* Live Coach Messages */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Live Feedback</p>
            <div className="flex flex-col gap-2">
              {coachMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-xs leading-relaxed border-l-2 ${
                    msg.type === 'success'
                      ? 'bg-green-50 border-green-400 text-green-800'
                      : msg.type === 'warning'
                      ? 'bg-amber-50 border-amber-400 text-amber-800'
                      : 'bg-blue-50 border-blue-400 text-blue-800'
                  }`}
                >
                  <span className="mr-1">
                    {msg.type === 'success' ? '✓' : msg.type === 'warning' ? '!' : '💡'}
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          {/* QA Checklist — synced to fields */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">QA Checklist</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                qaScore === qaTotal ? 'bg-green-100 text-green-700' :
                qaScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {qaScore}/{qaTotal}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {qaChecklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs transition-all ${
                    item.done ? 'bg-[#4db8a4]' : 'bg-gray-200'
                  }`}>
                    {item.done ? '✓' : ''}
                  </div>
                  <span className={`text-xs transition-all ${
                    item.done ? 'text-[#1a2744] font-medium' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            {/* QA progress bar */}
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4db8a4] rounded-full transition-all duration-500"
                style={{ width: `${(qaScore / qaTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Scenario Info */}
          {selected && (
            <div className="p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Scenario Info</p>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty</span>
                  <span className="font-semibold text-[#1a2744] capitalize">{selected.difficulty ?? 'Beginner'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="font-semibold text-[#1a2744]">{selected.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Correct Priority</span>
                  <span className="font-semibold text-[#1a2744]">{selected.correct_priority ?? 'TBD'}</span>
                </div>
                {selected.caller_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Caller</span>
                    <span className="font-semibold text-[#1a2744]">{selected.caller_name}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-[#f0fdfa] rounded-lg border border-[#4db8a4]/20">
                <p className="text-xs text-[#0f6e56] leading-relaxed">
                  <strong>Remember:</strong> The AI Coach and QA score the same 7 fields. Green checkmarks = points earned.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
