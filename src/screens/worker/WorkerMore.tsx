import { useState } from 'react'
import { Avatar, Badge, Button, EmptyState, Sheet, StatusBar, Toggle } from '../../components/ui'
import { ChevronRight, DollarIcon, EditIcon, ToolIcon, ShieldIcon } from '../../components/Icons'
import { CATEGORIES, rs } from '../../data/catalog'
import { jobEmoji, jobTitle } from '../../data/jobs'
import type { Profile } from '../auth/Auth'
import type { Skills } from './Onboarding'
import type { HistoryItem, MyJob } from './types'

interface Payment { id: string; title: string; emoji: string; daysAgo: number; amount: number }

export function toPayments(completed: MyJob[], history: HistoryItem[]): Payment[] {
  return [
    ...completed.map(m => ({ id: m.job.id, title: jobTitle(m.job), emoji: jobEmoji(m.job), daysAgo: 0, amount: m.earned ?? 0 })),
    ...history.map(h => ({ id: h.id, title: h.title, emoji: h.emoji, daysAgo: h.daysAgo, amount: h.amount })),
  ]
}

export function EarningsScreen({ completed, history, onWithdraw }: { completed: MyJob[]; history: HistoryItem[]; onWithdraw: (amt: number) => void }) {
  const [sheet, setSheet] = useState(false)
  const [withdrawn, setWithdrawn] = useState(0)
  const pays = toPayments(completed, history)
  const week = pays.filter(p => p.daysAgo < 7).reduce((a, p) => a + p.amount, 0)
  const today = pays.filter(p => p.daysAgo === 0).reduce((a, p) => a + p.amount, 0)
  const balance = Math.max(0, week - withdrawn)
  const days = Array.from({ length: 7 }, (_, i) => 6 - i)
  const perDay = days.map(d => pays.filter(p => p.daysAgo === d).reduce((a, p) => a + p.amount, 0))
  const max = Math.max(1, ...perDay)
  const dayLabel = (d: number) => (d === 0 ? 'Today' : new Date(Date.now() - d * 864e5).toLocaleDateString('en-US', { weekday: 'short' }))

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div className="bg-emerald-600 flex-shrink-0">
        <StatusBar light/>
        <div className="px-5 pb-5 pt-1">
          <div className="font-extrabold text-white text-xl mb-4">Earnings</div>
          <div className="bg-white/15 rounded-2xl p-4">
            <div className="text-emerald-100 text-xs font-semibold">Available balance</div>
            <div className="text-3xl font-extrabold text-white mt-0.5">{rs(balance)}</div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-emerald-100 text-xs">Today {rs(today)} · Week {rs(week)}</div>
              <button disabled={!balance} onClick={() => setSheet(true)} className="px-3 py-1.5 bg-white text-emerald-700 text-xs font-bold rounded-lg disabled:opacity-50">Withdraw</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="text-sm font-bold text-gray-700 mb-4">Last 7 days</div>
          <div className="flex items-end gap-2 h-32">
            {days.map((d, i) => (
              <div key={d} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                {perDay[i] > 0 && <span className="text-[9px] font-bold text-gray-500">{Math.round(perDay[i] / 1000)}k</span>}
                <div className="w-full rounded-t-lg transition-all duration-700" style={{ height: `${Math.max(4, (perDay[i] / max) * 96)}px`, background: d === 0 ? '#10B981' : '#D1FAE5' }}/>
                <span className={`text-[10px] font-semibold ${d === 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{dayLabel(d)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { l: 'Jobs this week', v: String(pays.filter(p => p.daysAgo < 7).length), e: '✅' },
            { l: 'Avg per job', v: pays.length ? rs(week / Math.max(1, pays.filter(p => p.daysAgo < 7).length)) : rs(0), e: '📊' },
          ].map(s => (
            <div key={s.l} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-xl">{s.e}</div>
              <div className="font-extrabold text-gray-900 text-lg mt-1">{s.v}</div>
              <div className="text-[11px] text-gray-400 font-semibold">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 font-bold text-gray-900">Payments</div>
          {pays.length === 0 ? (
            <EmptyState emoji="💸" title="No payments yet" desc="Complete your first job to see earnings here."/>
          ) : pays.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-lg">{p.emoji}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900">{p.title}</div>
                <div className="text-xs text-gray-400">{p.daysAgo === 0 ? 'Today' : p.daysAgo === 1 ? 'Yesterday' : `${p.daysAgo} days ago`}</div>
              </div>
              <div className="font-bold text-emerald-600">+{rs(p.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Withdraw earnings">
        <div className="text-center bg-gray-50 rounded-2xl p-5 mb-4">
          <div className="text-xs text-gray-500">Amount</div>
          <div className="text-3xl font-extrabold text-gray-900">{rs(balance)}</div>
        </div>
        <div className="flex items-center gap-3 p-4 border-2 border-emerald-300 bg-emerald-50 rounded-2xl mb-5">
          <span className="text-2xl">📱</span>
          <div className="flex-1"><div className="font-bold text-sm">JazzCash</div><div className="text-xs text-gray-500">•••• 4521 · arrives instantly</div></div>
          <DollarIcon size={18} className="text-emerald-600"/>
        </div>
        <Button className="w-full" onClick={() => { onWithdraw(balance); setWithdrawn(w => w + balance); setSheet(false) }}>Withdraw {rs(balance)}</Button>
      </Sheet>
    </div>
  )
}

export function WorkerProfile({ profile, skills, verification, online, onToggleOnline, rating, jobsDone, onEditSkills, onDocuments, onEarnings, onSignOut }: {
  profile: Profile
  skills: Skills
  verification: 'pending' | 'verified'
  online: boolean
  onToggleOnline: (v: boolean) => void
  rating: number
  jobsDone: number
  onEditSkills: () => void
  onDocuments: () => void
  onEarnings: () => void
  onSignOut: () => void
}) {
  const groups = CATEGORIES.map(c => ({ c, subs: c.subs.filter(s => skills[s.id]) })).filter(g => g.subs.length)
  const tools = Array.from(new Set(groups.flatMap(g => g.subs.filter(s => skills[s.id]?.tools).flatMap(s => s.tools))))

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <StatusBar/>
        <div className="px-5 pb-3 pt-1 font-extrabold text-gray-900 text-xl">Profile</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white mb-3 px-5 py-5">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} size={72}/>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-gray-900 text-lg truncate">{profile.name}</div>
              <div className="text-xs text-gray-500 truncate">{profile.phone} · {profile.city}</div>
              <div className="flex items-center gap-1.5 mt-2">
                {verification === 'verified' ? <Badge label="✓ Verified" color="green"/> : <Badge label="Verification pending" color="amber" dot/>}
                {jobsDone >= 3 && <Badge label="Top worker" color="blue"/>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[{ l: 'Jobs done', v: String(jobsDone) }, { l: 'Rating', v: rating ? `${rating.toFixed(1)} ⭐` : 'New' }, { l: 'Skills', v: String(Object.keys(skills).length) }].map(s => (
              <div key={s.l} className="bg-gray-50 rounded-xl py-3 text-center">
                <div className="font-extrabold text-gray-900">{s.v}</div>
                <div className="text-[11px] text-gray-400">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white mb-3 px-5 py-4 flex items-center gap-3">
          <span className="text-xl">{online ? '🟢' : '⚪'}</span>
          <div className="flex-1">
            <div className="font-bold text-sm text-gray-900">Availability</div>
            <div className="text-xs text-gray-500">{online ? 'Online — receiving job requests' : 'Offline — not receiving jobs'}</div>
          </div>
          <Toggle on={online} onChange={onToggleOnline}/>
        </div>

        <div className="bg-white mb-3 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-gray-900">My skills</div>
            <button onClick={onEditSkills} className="flex items-center gap-1 text-emerald-600 text-sm font-bold"><EditIcon size={14}/> Edit</button>
          </div>
          {groups.length === 0 && <div className="text-sm text-gray-400">No skills yet — add some to get matched with jobs.</div>}
          {groups.map(({ c, subs }) => (
            <div key={c.id} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span>{c.emoji}</span><span className="font-semibold text-sm text-gray-800">{c.name}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {subs.map(s => (
                  <span key={s.id} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 flex items-center gap-1">
                    ✓ {s.name}{skills[s.id]?.tools && <ToolIcon size={11}/>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white mb-3 px-5 py-4">
          <div className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ToolIcon size={16}/> My tools</div>
          {tools.length === 0 ? (
            <div className="text-sm text-gray-400">Mark “I have the tools” on a skill to list them here.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {tools.map(t => <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">🔧 {t}</span>)}
            </div>
          )}
        </div>

        <div className="bg-white mb-3">
          {[
            { icon: <ShieldIcon size={18} className="text-emerald-600"/>, l: 'Documents', s: verification === 'verified' ? 'CNIC verified' : 'Under review', go: onDocuments },
            { icon: <DollarIcon size={18} className="text-emerald-600"/>, l: 'Earnings & payouts', s: 'JazzCash •••• 4521', go: onEarnings },
          ].map(r => (
            <button key={r.l} onClick={r.go} className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 active:bg-gray-50">
              <span className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">{r.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm text-gray-900">{r.l}</div>
                <div className="text-xs text-gray-400">{r.s}</div>
              </div>
              <ChevronRight size={16} className="text-gray-300"/>
            </button>
          ))}
        </div>

        <div className="bg-white mb-8">
          <button onClick={onSignOut} className="w-full flex items-center gap-4 px-5 py-4 text-red-500 active:bg-red-50">
            <span className="text-xl">🚪</span>
            <div className="font-bold text-sm">Sign out</div>
          </button>
        </div>
      </div>
    </div>
  )
}
