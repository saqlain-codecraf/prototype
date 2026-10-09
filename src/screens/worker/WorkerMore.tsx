import { useState } from 'react'
import { Avatar, Badge, Button, EmptyState, IconTile, ScreenHeader, Sheet, StatusBar, Toggle } from '../../components/ui'
import { ChevronRight, DollarIcon, EditIcon, ToolIcon, ShieldIcon, Glyph } from '../../components/Icons'
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
    <div className="flex flex-col h-full bg-canvas relative">
      <ScreenHeader title="Earnings">
        <div className="px-screen pb-5">
          <div className="bg-white/10 border border-white/15 rounded-card p-4">
            <div className="text-white/75 text-ui font-bold">Available balance</div>
            <div className="display text-price text-white mt-1">{rs(balance)}</div>
            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="text-white/75 text-small">Today {rs(today)} · Week {rs(week)}</div>
              <Button variant="accent" size="sm" disabled={!balance} onClick={() => setSheet(true)}>Withdraw</Button>
            </div>
          </div>
        </div>
      </ScreenHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="bg-surface rounded-card p-4 border border-divider mb-4">
          <div className="text-body font-bold text-label mb-4">Last 7 days</div>
          <div className="flex items-end gap-2 h-32">
            {days.map((d, i) => (
              <div key={d} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                {perDay[i] > 0 && <span className="text-tab font-bold text-muted">{Math.round(perDay[i] / 1000)}k</span>}
                <div className="w-full rounded-t-lg transition-all duration-700" style={{ height: `${Math.max(4, (perDay[i] / max) * 96)}px`, background: d === 0 ? '#10B981' : '#D1FAE5' }}/>
                <span className={`text-tab font-bold ${d === 0 ? 'text-brand' : 'text-subtle'}`}>{dayLabel(d)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { l: 'Jobs this week', v: String(pays.filter(p => p.daysAgo < 7).length), e: '✅' },
            { l: 'Avg per job', v: pays.length ? rs(week / Math.max(1, pays.filter(p => p.daysAgo < 7).length)) : rs(0), e: '📊' },
          ].map(s => (
            <div key={s.l} className="bg-surface rounded-card p-4 border border-divider">
              <IconTile size={44}><Glyph e={s.e} size={22}/></IconTile>
              <div className="display text-ink text-lg mt-1">{s.v}</div>
              <div className="text-small text-subtle font-bold">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-card border border-divider overflow-hidden">
          <div className="px-4 py-3 border-b border-divider font-bold text-ink">Payments</div>
          {pays.length === 0 ? (
            <EmptyState emoji={<Glyph e="💸"/>} title="No payments yet" desc="Complete your first job to see earnings here."/>
          ) : pays.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-divider last:border-0">
              <div className="w-10 h-10 bg-mint rounded-tile flex items-center justify-center text-lg text-brand"><Glyph e={p.emoji}/></div>
              <div className="flex-1">
                <div className="font-bold text-body text-ink">{p.title}</div>
                <div className="text-small text-subtle">{p.daysAgo === 0 ? 'Today' : p.daysAgo === 1 ? 'Yesterday' : `${p.daysAgo} days ago`}</div>
              </div>
              <div className="font-bold text-brand">+{rs(p.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Withdraw earnings">
        <div className="text-center bg-canvas rounded-card p-5 mb-4">
          <div className="text-small text-muted">Amount</div>
          <div className="text-3xl display text-ink">{rs(balance)}</div>
        </div>
        <div className="flex items-center gap-3 p-4 border-2 border-brand bg-mint rounded-card mb-5 text-brand">
          <span className="text-2xl"><Glyph e="📱"/></span>
          <div className="flex-1"><div className="font-bold text-body">JazzCash</div><div className="text-small text-muted">•••• 4521 · arrives instantly</div></div>
          <DollarIcon size={18} className="text-brand"/>
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
    <div className="flex flex-col h-full bg-canvas">
      <ScreenHeader title="Profile"/>
      <div className="flex-1 overflow-y-auto">
        <div className="bg-surface mb-3 px-5 py-5">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} size={72}/>
            <div className="flex-1 min-w-0">
              <div className="display text-ink text-lg truncate">{profile.name}</div>
              <div className="text-small text-muted truncate">{profile.phone} · {profile.city}</div>
              <div className="flex items-center gap-1.5 mt-2">
                {verification === 'verified' ? <Badge label="✓ Verified" color="green"/> : <Badge label="Verification pending" color="amber" dot/>}
                {jobsDone >= 3 && <Badge label="Top worker" color="blue"/>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[{ l: 'Jobs done', v: String(jobsDone) }, { l: 'Rating', v: rating ? rating.toFixed(1) : 'New' }, { l: 'Skills', v: String(Object.keys(skills).length) }].map(s => (
              <div key={s.l} className="bg-canvas rounded-tile py-3 text-center">
                <div className="display text-ink">{s.v}</div>
                <div className="text-small text-subtle">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface mb-3 px-5 py-4 flex items-center gap-3">
          <span className="text-xl"><span className={`block w-3.5 h-3.5 rounded-full ring-4 ${online ? 'bg-success ring-success/25' : 'bg-subtle ring-white/20'}`}/></span>
          <div className="flex-1">
            <div className="font-bold text-body text-ink">Availability</div>
            <div className="text-small text-muted">{online ? 'Online — receiving job requests' : 'Offline — not receiving jobs'}</div>
          </div>
          <Toggle on={online} onChange={onToggleOnline}/>
        </div>

        <div className="bg-surface mb-3 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-ink">My skills</div>
            <button onClick={onEditSkills} className="flex items-center gap-1 text-brand text-body font-bold"><EditIcon size={14}/> Edit</button>
          </div>
          {groups.length === 0 && <div className="text-body text-subtle">No skills yet — add some to get matched with jobs.</div>}
          {groups.map(({ c, subs }) => (
            <div key={c.id} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span><Glyph e={c.emoji}/></span><span className="font-bold text-body text-ink">{c.name}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {subs.map(s => (
                  <span key={s.id} className="px-2.5 py-1 bg-mint text-brand text-small font-bold rounded-full border border-line flex items-center gap-1">
                    ✓ {s.name}{skills[s.id]?.tools && <ToolIcon size={11}/>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface mb-3 px-5 py-4">
          <div className="font-bold text-ink mb-2 flex items-center gap-2"><ToolIcon size={16}/> My tools</div>
          {tools.length === 0 ? (
            <div className="text-body text-subtle">Mark “I have the tools” on a skill to list them here.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {tools.map(t => <span key={t} className="px-2.5 py-1 bg-divider text-label text-small font-bold rounded-full"><Glyph e="🔧"/> {t}</span>)}
            </div>
          )}
        </div>

        <div className="bg-surface mb-3">
          {[
            { icon: <ShieldIcon size={18} className="text-brand"/>, l: 'Documents', s: verification === 'verified' ? 'CNIC verified' : 'Under review', go: onDocuments },
            { icon: <DollarIcon size={18} className="text-brand"/>, l: 'Earnings & payouts', s: 'JazzCash •••• 4521', go: onEarnings },
          ].map(r => (
            <button key={r.l} onClick={r.go} className="w-full flex items-center gap-4 px-5 py-4 border-b border-divider last:border-0 active:bg-canvas">
              <span className="w-9 h-9 bg-mint rounded-tile flex items-center justify-center text-brand">{r.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-bold text-body text-ink">{r.l}</div>
                <div className="text-small text-subtle">{r.s}</div>
              </div>
              <ChevronRight size={16} className="text-subtle"/>
            </button>
          ))}
        </div>

        <div className="bg-surface mb-8">
          <button onClick={onSignOut} className="w-full flex items-center gap-4 px-5 py-4 text-danger active:bg-danger-tint">
            <span className="text-xl"><Glyph e="🚪"/></span>
            <div className="font-bold text-body">Sign out</div>
          </button>
        </div>
      </div>
    </div>
  )
}
