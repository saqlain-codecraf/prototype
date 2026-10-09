import { Avatar, Badge, Button, CountdownBar, StatusBar, Toggle } from '../../components/ui'
import { BellIcon, BriefcaseIcon, BarChartIcon, MessageIcon, UserIcon, MapPinIcon, ClockIcon, ToolIcon, Glyph } from '../../components/Icons'
import { rs } from '../../data/catalog'
import { jobHours, jobTitle, jobEmoji, priceLine, type Job } from '../../data/jobs'
import type { Bid, MyJob, WorkerTab } from './types'
import type { Skills } from './Onboarding'
import { ActiveJobCard, JobCard, matchesSkills } from './WorkerJobs'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function WorkerHome({ name, online, onToggleOnline, verification, today, todayJobs, week, feed, bids, active, skills, unread, onOpenJob, onOpenActive, onTab, onDocuments }: {
  name: string
  online: boolean
  onToggleOnline: (v: boolean) => void
  verification: 'pending' | 'verified'
  today: number
  todayJobs: number
  week: number
  feed: Job[]
  bids: Record<string, Bid>
  active: MyJob[]
  skills: Skills
  unread: number
  onOpenJob: (id: string) => void
  onOpenActive: (id: string) => void
  onTab: (t: WorkerTab) => void
  onDocuments: () => void
}) {
  const sorted = [...feed].sort((a, b) => Number(matchesSkills(b, skills)) - Number(matchesSkills(a, skills)) || a.distanceKm - b.distanceKm)
  const pendingBids = Object.values(bids).filter(b => b.status === 'pending').length

  return (
    <div className="flex flex-col h-full bg-canvas">
      {/* Header */}
      <div className={`flex-shrink-0 transition-colors duration-500 ${online ? 'bg-brand' : 'bg-ink'}`}>
        <StatusBar light/>
        <div className="px-5 pb-5 pt-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-medium text-white/60">{greeting()}</div>
              <div className="text-xl display text-white">{name.split(' ')[0]}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onTab('messages')} aria-label="Messages" className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <BellIcon size={18} className="text-white"/>
                {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-brand">{unread}</span>}
              </button>
              <button onClick={() => onTab('profile')} aria-label="Profile"><Avatar name={name} size={40} ring/></button>
            </div>
          </div>

          {/* Online toggle */}
          <div className="flex items-center gap-4 p-4 rounded-card bg-white/10 backdrop-blur">
            <div className="relative w-11 h-11 flex-shrink-0">
              {online && <span className="radar-ring" style={{ borderColor: '#fff' }}/>}
              <div className={`absolute inset-0 rounded-full flex items-center justify-center text-xl ${online ? 'bg-surface' : 'bg-white/15'}`}><span className={`block w-3.5 h-3.5 rounded-full ring-4 ${online ? 'bg-success ring-success/25' : 'bg-subtle ring-white/20'}`}/></div>
            </div>
            <div className="flex-1">
              <div className="display text-white">{online ? "You're online" : "You're offline"}</div>
              <div className="text-xs text-white/70">{online ? 'Looking for jobs near you…' : "You won't receive job requests"}</div>
            </div>
            <Toggle on={online} onChange={onToggleOnline} size="lg"/>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {verification === 'pending' && (
          <button onClick={onDocuments} className="w-full flex items-center gap-3 p-3 mb-4 bg-warn border border-accent rounded-card text-left">
            <span className="w-8 h-8 border-[3px] border-accent border-t-transparent rounded-full animate-spin flex-shrink-0"/>
            <div className="flex-1">
              <div className="text-sm font-bold text-warn-ink">Verifying your documents</div>
              <div className="text-xs text-warn-ink">You can browse jobs now. Bidding unlocks once verified.</div>
            </div>
          </button>
        )}

        {/* Earnings */}
        <button onClick={() => onTab('earnings')} className="w-full flex gap-3 mb-4 text-left">
          <div className="flex-1 bg-surface rounded-card p-4 border border-divider">
            <div className="text-[11px] font-bold text-subtle">Today</div>
            <div className="text-xl display text-ink mt-0.5">{rs(today)}</div>
            <div className="text-xs text-brand font-semibold mt-0.5">{todayJobs} job{todayJobs === 1 ? '' : 's'} completed</div>
          </div>
          <div className="flex-1 bg-surface rounded-card p-4 border border-divider">
            <div className="text-[11px] font-bold text-subtle">This week</div>
            <div className="text-xl display text-ink mt-0.5">{rs(week)}</div>
            <div className="text-xs text-subtle font-semibold mt-0.5">View earnings →</div>
          </div>
        </button>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { l: 'Open jobs', Icon: BriefcaseIcon, n: feed.length, go: () => onTab('jobs') },
            { l: 'Active', Icon: ClockIcon, n: active.length, go: () => (active[0] ? onOpenActive(active[0].job.id) : onTab('jobs')) },
            { l: 'Messages', Icon: MessageIcon, n: unread, go: () => onTab('messages') },
            { l: 'Profile', Icon: UserIcon, n: 0, go: () => onTab('profile') },
          ].map(({ l, Icon, n, go }) => (
            <button key={l} onClick={go} className="relative bg-surface rounded-card py-3 flex flex-col items-center gap-1 border border-divider active:scale-95 transition-all">
              <Icon size={20} className="text-brand"/>
              <span className="text-[10px] font-bold text-muted">{l}</span>
              {n > 0 && <span className="absolute top-1.5 right-2 min-w-4 h-4 px-1 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center">{n}</span>}
            </button>
          ))}
        </div>

        {/* Active jobs */}
        {active.length > 0 && (
          <div className="mb-5 space-y-3">
            {active.map(m => <ActiveJobCard key={m.job.id} m={m} dark onOpen={() => onOpenActive(m.job.id)}/>)}
          </div>
        )}

        {online ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="display text-ink">Jobs near you</div>
                {pendingBids > 0 && <div className="text-[11px] text-warn-ink font-semibold">{pendingBids} bid{pendingBids > 1 ? 's' : ''} awaiting response</div>}
              </div>
              {feed.length > 0 && <button onClick={() => onTab('jobs')} className="text-brand text-sm font-bold">See all</button>}
            </div>
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="relative w-20 h-20 mb-4">
                  <span className="radar-ring"/><span className="radar-ring" style={{ animationDelay: '1.2s' }}/>
                  <div className="absolute inset-4 bg-brand rounded-full flex items-center justify-center"><MapPinIcon size={20} className="text-white"/></div>
                </div>
                <div className="font-bold text-ink">Searching nearby…</div>
                <div className="text-sm text-subtle max-w-[240px]">We'll alert you the moment a job matching your skills is posted.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.slice(0, 4).map(j => <JobCard key={j.id} job={j} bid={bids[j.id]} match={matchesSkills(j, skills)} onOpen={() => onOpenJob(j.id)}/>)}
              </div>
            )}
          </>
        ) : (
          <div className="bg-surface rounded-sheet p-6 text-center border border-divider">
            <div className="text-4xl mb-2"><Glyph e="😴"/></div>
            <div className="display text-ink">You're offline</div>
            <div className="text-sm text-muted mb-4">Go online to receive new job requests and start earning.</div>
            <Button className="w-full" onClick={() => onToggleOnline(true)}>Go online</Button>
            {active.length === 0 && (
              <button onClick={() => onTab('earnings')} className="mt-3 text-sm font-semibold text-muted flex items-center justify-center gap-1 w-full">
                <BarChartIcon size={14}/> See your earnings
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Real-time new job alert
// ------------------------------------------------------------------

export function NewJobAlert({ job, onView, onAccept, onDismiss, canBid }: {
  job: Job
  onView: () => void
  onAccept: () => void
  onDismiss: () => void
  canBid: boolean
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-ink/50 anim-fade-in" onClick={onDismiss}/>
      <div className="relative w-full bg-surface rounded-t-3xl p-5 pb-7 anim-slide-up-sheet">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 bg-brand rounded-full flex items-center justify-center anim-wiggle"><BellIcon size={18} className="text-white"/></span>
          <div className="flex-1">
            <div className="text-[11px] display text-brand ">NEW JOB NEAR YOU</div>
            <div className="text-[11px] text-subtle">Respond quickly — others can see it too</div>
          </div>
          {job.urgent && <Badge label="Urgent" color="red"/>}
        </div>
        <CountdownBar key={job.id} seconds={20} onEnd={onDismiss}/>

        <div className="flex items-center gap-3 mt-4">
          <span className="w-14 h-14 bg-mint rounded-card flex items-center justify-center text-3xl text-brand"><Glyph e={jobEmoji(job)}/></span>
          <div className="flex-1 min-w-0">
            <div className="display text-lg text-ink truncate">{jobTitle(job)}</div>
            <div className="text-xs text-muted">{job.area} · {job.hirer.name}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { i: <MapPinIcon size={14}/>, v: `${job.distanceKm} km` },
            { i: <ClockIcon size={14}/>, v: `${jobHours(job)} hrs` },
            { i: <ToolIcon size={14}/>, v: job.toolsRequired ? 'Tools ✓' : 'No tools' },
            { i: <span className="text-xs"><Glyph e="📅"/></span>, v: job.dateLabel },
          ].map((x, k) => (
            <div key={k} className="bg-canvas rounded-tile py-2 flex flex-col items-center gap-0.5 text-muted">
              {x.i}<span className="text-[11px] font-bold text-ink">{x.v}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 p-3 bg-mint rounded-tile text-brand">
          <span className="text-sm font-semibold text-brand">Hirer offers</span>
          <span className="display text-brand text-lg">{priceLine(job)}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" className="flex-1" size="md" onClick={onDismiss}>Skip</Button>
          <Button variant="dark" className="flex-1" size="md" onClick={onView}>View & bid</Button>
          {canBid && <Button className="flex-1" size="md" onClick={onAccept}>Accept</Button>}
        </div>
      </div>
    </div>
  )
}
