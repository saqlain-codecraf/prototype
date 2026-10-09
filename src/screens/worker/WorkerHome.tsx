import { Avatar, Badge, Button, CountdownBar, IconTile, StatusBar, Toggle } from '../../components/ui'
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
      <div className="flex-shrink-0 bg-ink">
        <StatusBar light/>
        <div className="px-screen pb-5 pt-1">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0">
              <div className="text-ui font-medium text-white/70">{greeting()}</div>
              <h1 className="display text-title text-white truncate">{name.split(' ')[0]}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onTab('messages')} aria-label="Messages" className="relative size-touch rounded-full bg-white/15 flex items-center justify-center">
                <BellIcon size={22} className="text-white"/>
                {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-accent text-ink text-tab font-bold rounded-full flex items-center justify-center">{unread}</span>}
              </button>
              <button onClick={() => onTab('profile')} aria-label="Profile" className="size-touch flex items-center justify-center"><Avatar name={name} size={44} ring/></button>
            </div>
          </div>

          {/* Online toggle */}
          <div className={`flex items-center gap-4 p-4 rounded-card border transition-colors duration-300 ${online ? 'bg-white/10 border-success/60' : 'bg-white/5 border-white/15'}`}>
            <div className="relative size-11 flex-shrink-0">
              {online && <span className="radar-ring" style={{ borderColor: 'var(--color-success)' }}/>}
              <div className={`absolute inset-0 rounded-full flex items-center justify-center ${online ? 'bg-success/20' : 'bg-white/10'}`}>
                <span className={`block w-3.5 h-3.5 rounded-full ${online ? 'bg-success' : 'bg-white/40'}`}/>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="display text-[20px] text-white">{online ? "You're online" : "You're offline"}</div>
              <div className="text-small text-white/70">{online ? 'Looking for jobs near you…' : "You won't receive job requests"}</div>
            </div>
            <Toggle on={online} onChange={onToggleOnline} size="lg"/>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-screen py-5">
        {verification === 'pending' && (
          <button onClick={onDocuments} className="w-full flex items-center gap-3 p-4 mb-4 bg-warn rounded-card text-left">
            <span className="w-8 h-8 border-[3px] border-warn-ink/40 border-t-warn-ink rounded-full animate-spin flex-shrink-0"/>
            <div className="flex-1">
              <div className="text-body font-bold text-warn-ink">Verifying your documents</div>
              <div className="text-small text-warn-ink">You can browse jobs now. Bidding unlocks once verified.</div>
            </div>
          </button>
        )}

        {/* Earnings */}
        <button onClick={() => onTab('earnings')} className="w-full flex gap-3 mb-4 text-left">
          <div className="flex-1 bg-surface rounded-card p-4 border border-line">
            <div className="text-ui font-bold text-label">Today</div>
            <div className="display text-[26px] text-ink mt-1">{rs(today)}</div>
            <div className="text-small text-brand font-bold mt-1">{todayJobs} job{todayJobs === 1 ? '' : 's'} completed</div>
          </div>
          <div className="flex-1 bg-surface rounded-card p-4 border border-line">
            <div className="text-ui font-bold text-label">This week</div>
            <div className="display text-[26px] text-ink mt-1">{rs(week)}</div>
            <div className="text-small text-brand font-bold mt-1">View earnings</div>
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
            <button key={l} onClick={go} className="relative flex flex-col items-center gap-2 active:scale-95 transition-all">
              <IconTile size={56}><Icon size={24}/></IconTile>
              <span className="text-small font-bold text-label">{l}</span>
              {n > 0 && <span className="absolute -top-1 right-1 min-w-5 h-5 px-1 bg-accent text-ink text-tab font-bold rounded-full flex items-center justify-center">{n}</span>}
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
                <h2 className="display text-[20px] text-ink">Jobs near you</h2>
                {pendingBids > 0 && <div className="text-small text-warn-ink font-bold">{pendingBids} bid{pendingBids > 1 ? 's' : ''} awaiting response</div>}
              </div>
              {feed.length > 0 && <button onClick={() => onTab('jobs')} className="min-h-touch px-1 text-brand text-ui font-bold">See all</button>}
            </div>
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="relative w-20 h-20 mb-4">
                  <span className="radar-ring"/><span className="radar-ring" style={{ animationDelay: '1.2s' }}/>
                  <div className="absolute inset-4 bg-brand rounded-full flex items-center justify-center"><MapPinIcon size={20} className="text-white"/></div>
                </div>
                <div className="display text-[20px] text-ink">Searching nearby…</div>
                <div className="text-body text-muted max-w-[260px] mt-1">We'll alert you the moment a job matching your skills is posted.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.slice(0, 4).map(j => <JobCard key={j.id} job={j} bid={bids[j.id]} match={matchesSkills(j, skills)} onOpen={() => onOpenJob(j.id)}/>)}
              </div>
            )}
          </>
        ) : (
          <div className="bg-surface rounded-card p-6 text-center border border-line">
            <IconTile size={64} className="mx-auto mb-3"><Glyph e="😴" size={30}/></IconTile>
            <div className="display text-heading text-ink">You're offline</div>
            <div className="text-body text-muted mt-1 mb-5">Go online to receive new job requests and start earning.</div>
            <Button className="w-full" onClick={() => onToggleOnline(true)}>Go online</Button>
            {active.length === 0 && (
              <button onClick={() => onTab('earnings')} className="mt-2 min-h-touch text-ui font-bold text-brand flex items-center justify-center gap-1.5 w-full">
                <BarChartIcon size={18}/> See your earnings
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
      <div className="relative w-full bg-surface rounded-t-sheet p-5 pb-7 anim-slide-up-sheet">
        <div className="flex items-center gap-2 mb-3">
          <span className="size-11 bg-accent rounded-full flex items-center justify-center anim-wiggle"><BellIcon size={22} className="text-ink"/></span>
          <div className="flex-1">
            <div className="display text-[20px] text-ink">New job near you</div>
            <div className="text-small text-muted">Respond quickly — others can see it too</div>
          </div>
          {job.urgent && <Badge label="Urgent" color="red"/>}
        </div>
        <CountdownBar key={job.id} seconds={20} onEnd={onDismiss}/>

        <div className="flex items-center gap-3 mt-4">
          <IconTile size={56}><Glyph e={jobEmoji(job)} size={28}/></IconTile>
          <div className="flex-1 min-w-0">
            <div className="display text-heading text-ink truncate">{jobTitle(job)}</div>
            <div className="text-small text-muted">{job.area} · {job.hirer.name}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { i: <MapPinIcon size={18}/>, v: `${job.distanceKm} km` },
            { i: <ClockIcon size={18}/>, v: `${jobHours(job)} hrs` },
            { i: <ToolIcon size={18}/>, v: job.toolsRequired ? 'Own tools' : 'No tools' },
            { i: <Glyph e="📅" size={18}/>, v: job.dateLabel },
          ].map((x, k) => (
            <div key={k} className="bg-canvas border border-divider rounded-tile py-2.5 flex flex-col items-center gap-1 text-brand">
              {x.i}<span className="text-small font-bold text-ink">{x.v}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 p-4 bg-mint rounded-card">
          <span className="text-ui font-bold text-brand">Hirer offers</span>
          <span className="display text-[26px] text-ink">{priceLine(job)}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" className="flex-1" onClick={onDismiss}>Skip</Button>
          <Button variant="secondary" className="flex-1" onClick={onView}>View & bid</Button>
          {canBid && <Button className="flex-1" onClick={onAccept}>Accept</Button>}
        </div>
      </div>
    </div>
  )
}
