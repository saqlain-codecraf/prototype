import { useEffect, useState } from 'react'
import { Avatar, Badge, Button, Chip, CountdownBar, EmptyState, Label, MapView, NumberStepper, PhotoThumb, Rating, ScreenHeader, SegmentTabs, StatusBar } from '../../components/ui'
import { ChevronLeft, ClockIcon, MapPinIcon, ToolIcon, AlertCircle, StarFilled, CheckCircle, Glyph } from '../../components/Icons'
import { findSub, rs } from '../../data/catalog'
import { jobCategoryName, jobEmoji, jobHours, jobTitle, jobUnitPrice, priceLine, totalFor, unitLabel, WORK_STEPS, stepIndex, type Job } from '../../data/jobs'
import type { Bid, HistoryItem, MyJob } from './types'
import type { Skills } from './Onboarding'

export const matchesSkills = (j: Job, skills: Skills) => j.lines.some(l => skills[l.subId])

export function BidBadge({ bid }: { bid?: Bid }) {
  if (!bid) return null
  if (bid.status === 'pending') return <Badge label="Bid sent" color="amber" dot/>
  if (bid.status === 'rejected') return <Badge label="Declined · Re-bid" color="red"/>
  return <Badge label="Accepted" color="green"/>
}

export function JobCard({ job, bid, match, onOpen }: { job: Job; bid?: Bid; match?: boolean; onOpen: () => void }) {
  const unit = jobUnitPrice(job)
  return (
    <button onClick={onOpen} className="w-full bg-surface rounded-card p-4 border border-line text-left active:scale-[0.98] transition-all anim-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-mint rounded-tile flex items-center justify-center text-2xl flex-shrink-0 text-brand"><Glyph e={jobEmoji(job)}/></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-body text-ink">{jobTitle(job)}</span>
            {job.urgent && <Badge label="Urgent" color="red"/>}
          </div>
          <div className="text-small text-muted mt-0.5">{jobCategoryName(job)} · {job.area.split(',')[0]}</div>
          <div className="flex items-center gap-3 mt-2 text-small text-muted">
            <span className="flex items-center gap-1"><MapPinIcon size={11}/>{job.distanceKm} km</span>
            <span className="flex items-center gap-1"><ClockIcon size={11}/>{jobHours(job)}h · {job.dateLabel}</span>
            <span className={`flex items-center gap-1 ${job.toolsRequired ? 'text-warn-ink' : 'text-muted'}`}><ToolIcon size={11}/>{job.toolsRequired ? 'Bring tools' : 'Tools provided'}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {match && <Badge label="Your skill" color="blue"/>}
            <BidBadge bid={bid}/>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="display text-body text-ink">{rs(unit)}</div>
          <div className="text-tab text-subtle">{job.payType === 'hourly' ? 'per hour' : 'fixed'}</div>
        </div>
      </div>
    </button>
  )
}

// ------------------------------------------------------------------
// Jobs tab
// ------------------------------------------------------------------

type JobsTab = 'open' | 'active' | 'completed'

export function JobsScreen({ feed, bids, active, completed, history, online, skills, onOpenJob, onOpenActive, onGoOnline, initialTab = 'open' }: {
  feed: Job[]
  bids: Record<string, Bid>
  active: MyJob[]
  completed: MyJob[]
  history: HistoryItem[]
  online: boolean
  skills: Skills
  onOpenJob: (id: string) => void
  onOpenActive: (id: string) => void
  onGoOnline: () => void
  initialTab?: JobsTab
}) {
  const [tab, setTab] = useState<JobsTab>(initialTab)
  const [onlyBids, setOnlyBids] = useState(false)
  const counts = { open: feed.length, active: active.length, completed: completed.length + history.length }
  const open = onlyBids ? feed.filter(j => bids[j.id]) : feed

  return (
    <div className="flex flex-col h-full bg-canvas">
      <ScreenHeader title="Jobs" right={
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-small font-bold ${online ? 'bg-success/20 text-white' : 'bg-white/10 text-white/80'}`}>
          <span className={`w-2 h-2 rounded-full ${online ? 'bg-success animate-pulse' : 'bg-white/50'}`}/>{online ? 'Online' : 'Offline'}
        </span>
      }>
        <div className="px-screen pb-4">
          <SegmentTabs value={tab} onChange={setTab}
            tabs={[{ id: 'open', label: 'Open', count: counts.open }, { id: 'active', label: 'Active', count: counts.active }, { id: 'completed', label: 'Done', count: counts.completed }]}/>
        </div>
      </ScreenHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {tab === 'open' && (
          <>
            {!online && (
              <div className="flex items-center gap-3 p-3 bg-ink rounded-card mb-4">
                <span className="text-xl"><Glyph e="😴"/></span>
                <div className="flex-1 text-small text-white/80">You're offline. Go online to get new jobs and bid.</div>
                <Button size="sm" onClick={onGoOnline}>Go online</Button>
              </div>
            )}
            {feed.length > 0 && (
              <div className="flex gap-2 mb-3">
                {[{ v: false, l: 'All nearby' }, { v: true, l: `My bids (${Object.keys(bids).filter(id => feed.some(j => j.id === id)).length})` }].map(o => (
                  <button key={o.l} onClick={() => setOnlyBids(o.v)} className={`min-h-touch px-4 rounded-full text-ui font-bold border-2 ${onlyBids === o.v ? 'bg-mint border-brand text-brand' : 'bg-surface border-line text-label'}`}>{o.l}</button>
                ))}
              </div>
            )}
            {open.length === 0 ? (
              <EmptyState emoji={<Glyph e="🔍"/>} title={onlyBids ? 'No active bids' : 'No open jobs yet'}
                desc={online ? 'New jobs near you will appear here instantly — we’ll notify you.' : 'Go online to start receiving job requests near you.'}/>
            ) : (
              <div className="space-y-3">
                {open.map(j => <JobCard key={j.id} job={j} bid={bids[j.id]} match={matchesSkills(j, skills)} onOpen={() => onOpenJob(j.id)}/>)}
              </div>
            )}
          </>
        )}

        {tab === 'active' && (active.length === 0 ? (
          <EmptyState emoji={<Glyph e="🧰"/>} title="No active jobs" desc="When a hirer accepts your bid, the job shows up here with location and chat."/>
        ) : (
          <div className="space-y-3">
            {active.map(m => <ActiveJobCard key={m.job.id} m={m} onOpen={() => onOpenActive(m.job.id)}/>)}
          </div>
        ))}

        {tab === 'completed' && (counts.completed === 0 ? (
          <EmptyState emoji={<Glyph e="🏁"/>} title="No completed jobs yet" desc="Finished jobs and what you earned will be listed here."/>
        ) : (
          <div className="space-y-3">
            {completed.map(m => (
              <CompletedRow key={m.job.id} emoji={jobEmoji(m.job)} title={jobTitle(m.job)} sub={`${m.job.area.split(',')[0]} · ${m.completedAt}`} amount={m.earned ?? 0} rating={m.hirerRating ?? 5} fresh/>
            ))}
            {history.map(h => (
              <CompletedRow key={h.id} emoji={h.emoji} title={h.title} sub={`${h.area} · ${h.daysAgo === 1 ? 'Yesterday' : `${h.daysAgo} days ago`}`} amount={h.amount} rating={h.rating}/>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function CompletedRow({ emoji, title, sub, amount, rating, fresh }: { emoji: string; title: string; sub: string; amount: number; rating: number; fresh?: boolean }) {
  return (
    <div className={`bg-surface rounded-card p-4 border ${fresh ? 'border-brand' : 'border-line'} flex items-center gap-3`}>
      <div className="w-12 h-12 bg-mint rounded-tile flex items-center justify-center text-2xl text-brand">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-body text-ink truncate">{title}</div>
        <div className="text-small text-muted truncate">{sub}</div>
        <div className="flex items-center gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map(i => <StarFilled key={i} size={11} className={i <= rating ? 'text-accent' : 'text-subtle'}/>)}
        </div>
      </div>
      <div className="text-right">
        <div className="display text-body text-brand">+{rs(amount)}</div>
        <Badge label="Paid" color="green"/>
      </div>
    </div>
  )
}

export function ActiveJobCard({ m, onOpen, dark }: { m: MyJob; onOpen: () => void; dark?: boolean }) {
  const idx = stepIndex(m.status)
  return (
    <button onClick={onOpen} className={`w-full rounded-card p-4 text-left active:scale-[0.98] transition-all ${dark ? 'bg-brand text-white' : 'bg-surface border-2 border-brand'}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge label="Active job" color={dark ? 'white' : 'green'} dot/>
        <span className={`text-small font-bold ${dark ? 'text-white' : 'text-brand'}`}>{WORK_STEPS[idx].label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl"><Glyph e={jobEmoji(m.job)}/></span>
        <div className="flex-1 min-w-0">
          <div className={`display truncate ${dark ? 'text-white' : 'text-ink'}`}>{jobTitle(m.job)}</div>
          <div className={`text-small truncate ${dark ? 'text-white' : 'text-muted'}`}>{m.job.dateLabel} · {m.job.time} · {m.job.area.split(',')[0]}</div>
        </div>
        <div className={`display text-body ${dark ? 'text-white' : 'text-ink'}`}>{rs(totalFor(m.job, m.unit))}</div>
      </div>
      <div className="flex gap-1 mt-3">
        {WORK_STEPS.slice(0, 5).map((s, i) => (
          <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= idx ? (dark ? 'bg-surface' : 'bg-brand') : dark ? 'bg-white/25' : 'bg-divider'}`}/>
        ))}
      </div>
    </button>
  )
}

// ------------------------------------------------------------------
// Job detail + live bidding
// ------------------------------------------------------------------

const round50 = (n: number) => Math.round(n / 50) * 50

export function JobDetailScreen({ job, bid, online, verified, taken, onBack, onBid, onSkip, onGoOnline }: {
  job: Job
  bid?: Bid
  online: boolean
  verified: boolean
  taken: boolean
  onBack: () => void
  onBid: (amount: number) => void
  onSkip: () => void
  onGoOnline: () => void
}) {
  const offer = jobUnitPrice(job)
  const step = job.payType === 'hourly' ? 50 : 100
  const last = bid?.history[bid.history.length - 1]
  const [amount, setAmount] = useState(() => (last ? Math.max(offer, round50(last * 0.95)) : round50(offer * 1.1)))
  const hours = jobHours(job)
  const low = round50(offer * 0.85)
  const high = round50(offer * 1.25)
  const pending = bid?.status === 'pending'
  const rejected = bid?.status === 'rejected'
  const unit = unitLabel(job.payType)

  // After a decline, suggest a bid a little closer to the hirer's offer.
  useEffect(() => {
    if (rejected && last) setAmount(Math.max(offer, round50(last * 0.95)))
  }, [rejected, last, offer])

  return (
    <div className="flex flex-col h-full bg-surface relative">
      <MapView
        height={230}
        pins={[{ id: 'me', x: 26, y: 62, kind: 'me' }, { id: 'job', x: 70, y: 40, kind: 'job', label: job.area.split(',')[0] }]}
        route={[{ x: 26, y: 62 }, { x: 70, y: 40 }]}
      >
        <div className="absolute top-0 left-0 right-0"><StatusBar/></div>
        <button onClick={onBack} aria-label="Back" className="absolute top-10 left-4 size-touch bg-surface rounded-full flex items-center justify-center shadow-md">
          <ChevronLeft size={18} className="text-label"/>
        </button>
        <div className="absolute bottom-6 left-4 bg-surface rounded-tile px-3 py-1.5 shadow-md flex items-center gap-1.5">
          <MapPinIcon size={12} className="text-brand"/>
          <span className="text-small font-bold text-ink">{job.distanceKm} km · ~{Math.round(job.distanceKm * 4)} min</span>
        </div>
      </MapView>

      <div className="flex-1 overflow-y-auto -mt-4 bg-surface rounded-t-3xl relative">
        <div className="w-10 h-1 bg-line rounded-full mx-auto mt-3"/>
        <div className="px-5 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl display text-ink">{jobTitle(job)}</h2>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge label={jobCategoryName(job)} color="green"/>
                {job.urgent && <Badge label="Urgent" color="red"/>}
                <Badge label={job.payType === 'hourly' ? 'Hourly' : 'Fixed price'} color="blue"/>
              </div>
            </div>
            <div className="bg-mint rounded-tile px-3 py-1.5 text-right flex-shrink-0 text-brand">
              <div className="text-tab text-brand font-bold">Hirer offers</div>
              <div className="text-brand display">{rs(offer)}</div>
              <div className="text-brand text-tab">{job.payType === 'hourly' ? 'per hour' : 'total'}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: '📅', l: 'When', v: `${job.dateLabel}, ${job.time}` },
              { icon: '⏱', l: 'Duration', v: `${hours} hour${hours > 1 ? 's' : ''}` },
              { icon: '🔧', l: 'Tools', v: job.toolsRequired ? 'Bring own' : 'Provided' },
            ].map(x => (
              <div key={x.l} className="bg-canvas rounded-tile p-2.5">
                <div className="text-base"><Glyph e={x.icon}/></div>
                <div className="text-tab text-subtle font-bold mt-0.5">{x.l}</div>
                <div className="text-small font-bold text-ink">{x.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Label>Services requested</Label>
            <div className="space-y-1.5">
              {job.lines.map(l => (
                <div key={l.subId} className="flex items-center justify-between text-body bg-canvas rounded-tile px-3 py-2">
                  <span className="font-bold text-ink">{findSub(l.subId)?.sub.name}</span>
                  <span className="text-muted text-small">{l.hours}h</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Label>Description</Label>
            <p className="text-body text-muted leading-relaxed">{job.description}</p>
            {job.photos.length > 0 && (
              <div className="flex gap-2 mt-3">{job.photos.map((p, i) => <PhotoThumb key={i} src={p}/>)}</div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 p-3 bg-canvas rounded-card">
            <Avatar name={job.hirer.name} size={40} tone="blue"/>
            <div className="flex-1">
              <div className="font-bold text-body text-ink">{job.hirer.name}</div>
              <div className="flex items-center gap-2"><Rating value={job.hirer.rating}/><span className="text-small text-subtle">· {job.hirer.jobs} jobs posted</span></div>
            </div>
            <Badge label="Verified" color="green"/>
          </div>

          <div className="mt-3 flex items-start gap-2 text-small text-muted">
            <MapPinIcon size={12} className="mt-0.5 text-subtle"/>
            <span>{job.area} · exact address is shared once you're assigned</span>
          </div>
        </div>

        {/* Bid panel */}
        <div className="mx-5 my-5">
          {taken ? (
            <div className="p-4 rounded-card bg-divider text-center">
              <div className="font-bold text-label">This job was assigned to another worker</div>
              <div className="text-small text-muted mt-1">Keep an eye out — new jobs arrive all the time.</div>
            </div>
          ) : pending ? (
            <div className="p-4 rounded-card bg-warn border border-accent anim-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <span className="radar-ring"/>
                  <span className="absolute inset-0 rounded-full bg-accent flex items-center justify-center text-ink text-lg"><Glyph e="⏳"/></span>
                </div>
                <div>
                  <div className="font-bold text-warn-ink">Waiting for {job.hirer.name.split(' ')[0]}…</div>
                  <div className="text-small text-warn-ink">Your bid: <b>{rs(bid!.amount)}{unit}</b> · usually responds in seconds</div>
                </div>
              </div>
              <CountdownBar seconds={4} color="bg-accent"/>
            </div>
          ) : (
            <div className="rounded-card bg-canvas p-4">
              {rejected && (
                <div className="flex items-start gap-2.5 p-3 bg-danger-tint border border-danger-tint rounded-tile mb-4 anim-slide-up">
                  <AlertCircle size={18} className="text-danger mt-0.5 flex-shrink-0"/>
                  <div className="flex-1">
                    <div className="text-body font-bold text-danger">Your bid was declined</div>
                    <div className="text-small text-danger">The job is still open — send a new bid closer to the hirer's offer.</div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {bid!.history.map((h, i) => (
                        <span key={i} className="text-tab font-bold bg-surface text-danger px-2 py-0.5 rounded-full line-through">{rs(h)}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <Label>{rejected ? 'Your new bid' : 'Your bid'}</Label>
                <span className="text-small text-subtle">Market {rs(low)}–{rs(high)}</span>
              </div>
              <NumberStepper value={amount} onChange={setAmount} min={low} max={high} step={step} format={v => `${rs(v)}${job.payType === 'hourly' ? '/hr' : ''}`}/>
              <div className="text-center text-small text-muted mt-1">
                {job.payType === 'hourly' ? <>You'd earn about <b className="text-ink">{rs(totalFor(job, amount))}</b> for {hours}h</> : 'Total for the whole job'}
              </div>
              <div className="h-1.5 bg-line rounded-full mt-3 relative">
                <div className="absolute top-0 bottom-0 bg-brand rounded-full" style={{ left: `${((offer - low) / (high - low)) * 100 - 6}%`, width: '12%' }}/>
                <div className="absolute -top-1 w-3.5 h-3.5 bg-brand rounded-full border-2 border-white shadow transition-all" style={{ left: `calc(${((amount - low) / (high - low)) * 100}% - 7px)` }}/>
              </div>
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {[offer, round50(offer * 1.05), round50(offer * 1.1), round50(offer * 1.2)].map((v, i) => (
                  <Chip key={v} selected={amount === v} onClick={() => setAmount(v)} className="px-3">
                    {i === 0 ? 'Offer · ' : ''}{rs(v)}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!taken && !pending && (
        <div className="px-5 pb-7 pt-3 border-t border-divider bg-surface">
          {!online ? (
            <Button className="w-full" onClick={onGoOnline}>Go online to bid</Button>
          ) : !verified ? (
            <div className="text-center">
              <div className="text-small text-warn-ink font-bold mb-2"><Glyph e="⏳"/> Your documents are being verified — bidding unlocks shortly</div>
              <Button className="w-full" disabled>Place bid</Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onSkip}>Skip</Button>
              <Button className="flex-[2]" onClick={() => onBid(amount)}>
                {amount === offer ? `Accept ${priceLine(job)}` : `${rejected ? 'Re-bid' : 'Bid'} ${rs(amount)}${unit}`}
              </Button>
            </div>
          )}
        </div>
      )}
      {bid?.status === 'accepted' && (
        <div className="px-5 pb-7 pt-3 border-t border-divider flex items-center gap-2 text-brand font-bold">
          <CheckCircle size={18}/> Bid accepted — see Active jobs
        </div>
      )}
    </div>
  )
}
