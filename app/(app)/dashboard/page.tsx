"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Submission {
  id: number;
  title: string;
  date: string;
  score: number;
}

interface GrowthItem {
  label: string;
  color: string;
  bg: string;
}

// ── Mock data — replace with your real session/API data ───────────────────
const user = {
  name: "Sonja",
  initials: "SJ",
  role: "Trainee",
  totalTickets: 2,
  avgScore: 35,
  bestScore: 52,
  streak: 0,
  certProgress: 35,
  ticketsToUnlock: 8,
};

const recentSubmissions: Submission[] = [
  { id: 1, title: "Password reset — new hire", date: "Apr 25, 2026", score: 18 },
  { id: 2, title: "Printer offline — HR floor", date: "Apr 18, 2026", score: 52 },
];

const growthItems: GrowthItem[] = [
  { label: "New Practice Session",      color: "#0e7c5b", bg: "#f0faf6" },
  { label: "Continue Last Scenario",    color: "#6b7a8f", bg: "#f4f5f7" },
  { label: "Improve Weak Area",         color: "#b45309", bg: "#fffbeb" },
  { label: "View Certificate Progress", color: "#6b7a8f", bg: "#f4f5f7" },
];

const navItems = [
  { label: "Dashboard",   href: "/dashboard",   active: true  },
  { label: "Learn",       href: "/learn",        active: false },
  { label: "Practice",    href: "/practice",     active: false },
  { label: "Feedback",    href: "/feedback",     active: false },
  { label: "Progress",    href: "/progress",     active: false },
  { label: "Settings",    href: "/settings",     active: false },
  { label: "Certificate", href: "/certificate",  active: false },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function getScoreStyle(score: number): { text: string; bg: string } {
  if (score >= 80) return { text: "#0e7c5b", bg: "#f0faf6" };
  if (score >= 60) return { text: "#b45309", bg: "#fffbeb" };
  return { text: "#c0392b", bg: "#fff0f0" };
}

// ── Sub-components ─────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const { text, bg } = getScoreStyle(score);
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ color: text, background: bg }}
    >
      {score}/100
    </span>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub?: string;
  valueColor?: string;
}

function StatCard({ icon, value, label, sub, valueColor }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ background: "#f4f5f7" }}
      >
        {icon}
      </div>
      <div
        className="text-2xl font-bold tracking-tight"
        style={{ color: valueColor ?? "#0f1623" }}
      >
        {value}
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1.5">{sub}</div>}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const scoreStyle = getScoreStyle(user.avgScore);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-48 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="text-[15px] font-bold text-gray-900 tracking-tight">TicketFLO</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Training</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all duration-150 border-l-2 no-underline ${
                item.active
                  ? "text-emerald-700 bg-emerald-50 border-emerald-600 font-medium"
                  : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-[11px] font-bold text-emerald-700 flex-shrink-0">
            {user.initials}
          </div>
          <div>
            <div className="text-[12px] font-semibold text-gray-800">{user.name} Jones</div>
            <div className="text-[11px] text-gray-400">{user.role}</div>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 p-7 overflow-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Every strong ticket builds career confidence.
            </p>
          </div>
          <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap">
            + Start Practice
          </button>
        </div>

        {/* Certification Progress */}
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 mb-4">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Certification Progress
            </span>
            <span className="text-[13px] font-bold text-emerald-700">
              {user.certProgress}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${user.certProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Complete {user.ticketsToUnlock} more tickets to unlock your certificate
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">

          <StatCard
            icon={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="2" stroke="#0e7c5b" strokeWidth="1.5" />
                <path d="M5 7h6M5 10h4" stroke="#0e7c5b" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            }
            value={user.totalTickets}
            label="Total Tickets"
            sub="Start your 3rd today"
          />

          <StatCard
            icon={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z"
                  stroke={scoreStyle.text}
                  strokeWidth="1.3"
                />
              </svg>
            }
            value={user.avgScore}
            label="Average Score"
            sub="Below 60 — let's fix that"
            valueColor={scoreStyle.text}
          />

          <StatCard
            icon={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z"
                  stroke="#b45309"
                  strokeWidth="1.3"
                />
              </svg>
            }
            value={user.bestScore}
            label="Best Score"
            sub="Push past 60 next time"
            valueColor="#b45309"
          />

          <StatCard
            icon={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2c3 1.5 4 4 2 7M8 2C5 3.5 4 6.5 6 9"
                  stroke="#9ea8b8"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path d="M6 12h4" stroke="#9ea8b8" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            }
            value={user.streak === 0 ? "—" : user.streak}
            label="Day Streak"
            sub={
              user.streak === 0
                ? "Start your streak today"
                : `${user.streak} Day Momentum Streak 🔥`
            }
            valueColor="#9ea8b8"
          />
        </div>

        {/* Bottom Grid */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 200px" }}>

          {/* Recent Submissions */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
              Recent Submissions
            </div>
            {recentSubmissions.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between py-3 ${
                  i < recentSubmissions.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div>
                  <div className="text-[13px] font-medium text-gray-700">{t.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreBadge score={t.score} />
                  <span className="text-[12px] text-gray-300 hover:text-gray-500 cursor-pointer transition-colors">
                    View →
                  </span>
                </div>
              </div>
            ))}
            <div className="mt-3">
              <a
                href="/feedback"
                className="text-[12px] text-emerald-700 font-medium hover:underline no-underline"
              >
                View all feedback →
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-3">

            {/* Tip of the Day */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
                Tip of the Day
              </div>
              <p className="text-[12px] text-emerald-900 leading-relaxed">
                Mention how many users are affected — one person or a whole department changes the urgency.
              </p>
            </div>

            {/* Growth Center */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex-1">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Growth Center
              </div>
              {growthItems.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 py-2 cursor-pointer group ${
                    i < growthItems.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bg }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: item.color }}
                    />
                  </div>
                  <span className="text-[12px] text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                    {item.label}
                  </span>
                  <span className="text-gray-300 ml-auto text-sm group-hover:text-gray-500 transition-colors">
                    ›
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
