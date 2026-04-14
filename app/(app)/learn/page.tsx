'use client'

import { useState } from 'react'

const modules = [
  {
    id: 1,
    title: 'Writing Effective Ticket Titles',
    icon: '✏️',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'text-blue-700',
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>A good ticket title is your first impression. It should immediately tell the support team what the problem is, where it is, and how severe it seems.</p>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Key principles:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Be specific — include the system, app, or asset involved</li>
            <li>Describe the problem, not the solution</li>
            <li>Mention who is affected (one user, team, department)</li>
            <li>Keep it under 80 characters when possible</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Examples:</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <span className="text-red-500 mt-0.5">✗</span>
              <div>
                <span className="font-medium text-red-700">Bad: </span>
                <span>"Email broken"</span>
                <p className="text-xs text-gray-400 mt-0.5">Too vague — which email? What is broken? Who is affected?</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <span className="font-medium text-green-700">Good: </span>
                <span>"User Unable to Login to Corporate Email Account (Outlook)"</span>
                <p className="text-xs text-gray-400 mt-0.5">Specific application, clear problem, actionable</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <span className="text-red-500 mt-0.5">✗</span>
              <div>
                <span className="font-medium text-red-700">Bad: </span>
                <span>"Fix my computer"</span>
                <p className="text-xs text-gray-400 mt-0.5">No description of the problem at all</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <span className="font-medium text-green-700">Good: </span>
                <span>"Manager Laptop Severe Performance Degradation - Dell XPS 15 #MGR-1042"</span>
                <p className="text-xs text-gray-400 mt-0.5">Includes asset info, type of issue, who is affected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Crafting Clear Descriptions',
    icon: '📝',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'text-purple-700',
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>The description is where you give the support team everything they need to understand and resolve the issue. Good descriptions significantly reduce back-and-forth communication.</p>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Always include:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>What happened</strong> — exact behavior observed</li>
            <li><strong>When it started</strong> — date, time, frequency</li>
            <li><strong>Who is affected</strong> — one user, team, or everyone</li>
            <li><strong>Business impact</strong> — is work blocked? Revenue at risk?</li>
            <li><strong>Environment details</strong> — OS, browser, app version</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Avoid:</h4>
          <ul className="space-y-1 list-disc list-inside text-gray-500">
            <li>Vague language: "it doesn't work", "something is wrong"</li>
            <li>Blaming specific people or teams</li>
            <li>Assumptions about the cause</li>
            <li>Irrelevant information</li>
          </ul>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="font-medium text-amber-700 mb-1">Pro tip:</p>
          <p className="text-amber-600">Write as if the reader has zero context about your work. Would someone in a different department understand the issue?</p>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'Steps to Reproduce',
    icon: '🔢',
    color: 'bg-teal-50 border-teal-200',
    headerColor: 'text-teal-700',
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>Reproducible steps are the most valuable part of a technical ticket. They allow IT to replicate the exact problem and verify when it is fixed.</p>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Format:</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs space-y-1">
            <p>1. Open [application] on [device/OS]</p>
            <p>2. Navigate to [specific location]</p>
            <p>3. Click/enter [specific action]</p>
            <p>4. Observe: [exact error message or behavior]</p>
            <p>Expected: [what should happen]</p>
            <p>Actual: [what actually happens]</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Key rules:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Number each step — don&apos;t use bullets</li>
            <li>Each step is one action only</li>
            <li>Copy error messages word-for-word (verbatim)</li>
            <li>Note if the issue is intermittent vs. consistent</li>
            <li>Mention any workarounds you tried</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Priority Levels Explained',
    icon: '🚨',
    color: 'bg-red-50 border-red-200',
    headerColor: 'text-red-700',
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>Choosing the right priority prevents priority inflation and ensures critical issues get immediate attention. Mis-prioritizing tickets is one of the most common help desk problems.</p>
        <div className="space-y-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="font-semibold text-red-700">Critical</span>
            </div>
            <p>Production system down, security breach, data loss, entire department cannot work. Requires immediate response (15-30 min SLA).</p>
            <p className="text-xs text-red-400 mt-1">Example: Company website down, ransomware detected, payroll system unavailable on pay day</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="font-semibold text-orange-700">High</span>
            </div>
            <p>Major functionality impaired, significant user impact, no workaround available. Response within 2-4 hours.</p>
            <p className="text-xs text-orange-400 mt-1">Example: Manager can&apos;t access email before important presentation, VPN down for remote worker</p>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="font-semibold text-yellow-700">Medium</span>
            </div>
            <p>Issue affects productivity but a workaround exists. Response within 8 hours / same business day.</p>
            <p className="text-xs text-yellow-500 mt-1">Example: Printer offline but users can print to another floor, one feature not working</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-semibold text-green-700">Low</span>
            </div>
            <p>Minor issue, cosmetic problem, or request. No significant productivity impact. Response within 24-48 hours.</p>
            <p className="text-xs text-green-500 mt-1">Example: Font looks different, software installation request for future project</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: 'Category Classification',
    icon: '🏷️',
    color: 'bg-indigo-50 border-indigo-200',
    headerColor: 'text-indigo-700',
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>Correct categorization routes your ticket to the right team and enables better reporting. Miscategorized tickets can sit in the wrong queue for hours.</p>
        <div className="space-y-2">
          {[
            { cat: 'Hardware', desc: 'Physical devices: laptops, desktops, printers, monitors, peripherals, phones. Asset numbers are especially important here.', color: 'bg-gray-100' },
            { cat: 'Software', desc: 'Application issues, installation requests, license problems, software crashes, feature requests.', color: 'bg-blue-50' },
            { cat: 'Network', desc: 'Internet connectivity, VPN, Wi-Fi, wired connections, bandwidth, network drives, firewall issues.', color: 'bg-cyan-50' },
            { cat: 'Account Access', desc: 'Login problems, password resets, MFA/2FA issues, account lockouts, permission requests, new user setup.', color: 'bg-purple-50' },
            { cat: 'Performance', desc: 'Slow systems, high CPU/memory usage, application freezing, long load times, battery drain.', color: 'bg-orange-50' },
            { cat: 'Other', desc: 'Anything that doesn\'t clearly fit the above. Use sparingly — try to find a better fit first.', color: 'bg-gray-50' },
          ].map(({ cat, desc, color }) => (
            <div key={cat} className={`p-3 ${color} rounded-lg border border-gray-100`}>
              <span className="font-semibold text-gray-800">{cat}: </span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: 'Professional Communication',
    icon: '💼',
    color: 'bg-amber-50 border-amber-200',
    headerColor: 'text-amber-700',
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>How you communicate in a ticket affects how quickly and effectively your issue gets resolved. Professional tickets get professional responses.</p>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Tone guidelines:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Be factual and objective, not emotional</li>
            <li>Avoid blame — describe what the system does, not who caused it</li>
            <li>Be concise but complete — don&apos;t over-explain or under-explain</li>
            <li>Use technical terms correctly, or describe in plain English</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Ticket lifecycle awareness:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>New</strong> — just submitted, awaiting triage</li>
            <li><strong>In Progress</strong> — assigned to an agent</li>
            <li><strong>Pending</strong> — waiting for your response or action</li>
            <li><strong>Resolved</strong> — fix applied, pending your confirmation</li>
            <li><strong>Closed</strong> — confirmed resolved or auto-closed</li>
          </ul>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="font-medium text-amber-700 mb-1">Remember:</p>
          <p className="text-amber-600">Respond promptly to pending tickets. An unreplied ticket can auto-close and you&apos;ll lose your place in the queue!</p>
        </div>
      </div>
    ),
  },
]

export default function LearnPage() {
  const [openModule, setOpenModule] = useState<number | null>(null)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a2744]">Learning Modules</h1>
        <p className="text-gray-500 mt-1">Master IT help desk ticket writing with these 6 modules</p>
      </div>

      <div className="space-y-4 max-w-3xl">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className={`bg-white rounded-xl shadow-sm border ${openModule === mod.id ? 'border-[#4db8a4]' : 'border-gray-100'} overflow-hidden transition-all`}
          >
            <button
              onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl ${mod.color}`}>
                  {mod.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[#1a2744]">{mod.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Module {mod.id} of {modules.length}</div>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${openModule === mod.id ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {openModule === mod.id && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                {mod.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-[#1a2744] rounded-xl text-white max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🎯</span>
          <h3 className="font-semibold text-[#4db8a4]">Ready to practice?</h3>
        </div>
        <p className="text-gray-300 text-sm mb-4">Apply what you&apos;ve learned by working through real-world IT scenarios and get AI-powered feedback on your tickets.</p>
        <a
          href="/practice"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4db8a4] text-white rounded-lg text-sm font-medium hover:bg-[#3da898] transition"
        >
          Start Practicing
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}
