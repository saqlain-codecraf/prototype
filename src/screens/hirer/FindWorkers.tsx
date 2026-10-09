import { useEffect, useRef, useState } from 'react'
import { Avatar, Badge, Button, Confirm, CountdownBar, MapView, Radio, Rating, Row, Sheet, StatusBar } from '../../components/ui'
import { ChevronLeft, MapPinIcon, ClockIcon, ToolIcon, ShieldIcon, Glyph } from '../../components/Icons'
import { rs } from '../../data/catalog'
import { CANDIDATES, PAYMENT_METHODS, type Candidate } from '../../data/mock'
import { jobEmoji, jobHours, jobTitle, jobUnitPrice, totalFor, uid, unitLabel } from '../../data/jobs'
import type { HirerJob } from './types'

interface LiveBid {
  id: string
  c: Candidate
  amount: number
  rebid: boolean
}

const BID_TTL = 10

export function FindWorkersScreen({ hj, onBack, onCancel, onAssign }: {
  hj: HirerJob
  onBack: () => void
  onCancel: () => void
  onAssign: (c: Candidate, unit: number, method: string) => void
}) {
  const { job } = hj
  const offer = jobUnitPrice(job)
  const roundTo = job.payType === 'hourly' ? 50 : 100
  const round = (n: number) => Math.round(n / roundTo) * roundTo

  const [bids, setBids] = useState<LiveBid[]>([])
  const [notified, setNotified] = useState(0)
  const [streamDone, setStreamDone] = useState(false)
  const [focus, setFocus] = useState<string | null>(null)
  const [selected, setSelected] = useState<LiveBid | null>(null)
  const [sheetStep, setSheetStep] = useState<'confirm' | 'payment'>('confirm')
  const [method, setMethod] = useState('cash')
  const [assigning, setAssigning] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)) }
  const addBid = (c: Candidate, amount: number, rebid: boolean) => {
    const b = { id: uid(), c, amount, rebid }
    setBids(prev => [b, ...prev.filter(x => x.c.id !== c.id)])
    setFocus(b.id)
  }

  // Nearby workers respond one by one.
  useEffect(() => {
    let idx = 0
    setNotified(0)
    const ping = setInterval(() => setNotified(n => Math.min(n + 3, 18)), 700)
    const tick = () => {
      if (idx >= CANDIDATES.length) { setStreamDone(true); return }
      const c = CANDIDATES[idx++]
      addBid(c, Math.max(roundTo, round(offer * c.bidFactor)), false)
      later(tick, 5000)
    }
    later(tick, 2500)
    return () => { clearInterval(ping); timers.current.forEach(clearTimeout); timers.current = [] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remove = (id: string) => setBids(prev => prev.filter(b => b.id !== id))

  const reject = (b: LiveBid) => {
    remove(b.id)
    // A declined worker may come back with a better offer while the job is unassigned.
    if (!b.rebid && b.amount > offer) later(() => addBid(b.c, Math.max(offer, round(b.amount * 0.93)), true), 6000)
  }

  // Offers vanish after BID_TTL seconds (unless the hirer is reviewing it). A worker whose
  // offer expired may send one more, slightly lower offer.
  const selectedRef = useRef<LiveBid | null>(null)
  selectedRef.current = selected
  const expiredWhileOpen = useRef<string | null>(null)
  const expire = (b: LiveBid) => {
    if (selectedRef.current?.id === b.id) { expiredWhileOpen.current = b.id; return }
    remove(b.id)
    if (!b.rebid) later(() => addBid(b.c, Math.max(offer, round(b.amount * 0.96)), true), 7000)
  }

  const assign = () => {
    if (!selected) return
    setAssigning(true)
    later(() => onAssign(selected.c, selected.amount, method), 1000)
  }

  const pins = [
    { id: 'home', x: 50, y: 46, kind: 'home' as const, label: 'Job' },
    ...bids.map(b => ({
      id: b.id, x: b.c.x, y: b.c.y, kind: 'worker' as const,
      label: b.c.name.split(' ').map(w => w[0]).join(''),
      sub: `${rs(b.amount).replace('Rs ', '')}`,
      active: focus === b.id,
      onClick: () => setFocus(b.id),
    })),
  ]
  const hours = jobHours(job)
  const unit = unitLabel(job.payType)

  return (
    <div className="relative h-full bg-surface overflow-hidden">
      <div className="absolute inset-0">
        <MapView height="100%" pins={pins}>
          <div className="absolute w-44 h-44 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: '50%', top: '46%' }}>
            <span className="radar-ring"/><span className="radar-ring" style={{ animationDelay: '0.8s' }}/><span className="radar-ring" style={{ animationDelay: '1.6s' }}/>
          </div>
        </MapView>
      </div>

      <div className="absolute top-0 left-0 right-0"><StatusBar/></div>
      <div className="absolute top-10 left-4 right-4 flex items-center gap-2 z-10">
        <button onClick={onBack} aria-label="Back" className="size-touch bg-surface rounded-full flex items-center justify-center shadow-md">
          <ChevronLeft size={18} className="text-label"/>
        </button>
        <div className="flex-1"/>
        <div className="bg-surface rounded-full px-3 py-2 shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 bg-brand rounded-full animate-pulse"/>
          <span className="text-small font-bold text-ink">{notified} workers notified</span>
        </div>
      </div>

      {/* Live offers — stacked at the top over the map, newest first, each expires after BID_TTL seconds */}
      <div className="absolute top-[92px] left-3 right-3 bottom-[168px] overflow-y-auto space-y-2.5 pointer-events-none z-10">
        {bids.map(b => {
          const diff = Math.round(((b.amount - offer) / offer) * 100)
          const toolsWarn = job.toolsRequired && !b.c.hasTools
          return (
            <div key={b.id} onClick={() => setFocus(b.id)}
              className={`pointer-events-auto bg-surface rounded-card shadow-xl overflow-hidden anim-toast border-2 ${focus === b.id ? 'border-brand' : 'border-transparent'}`}>
              <CountdownBar key={b.id} seconds={BID_TTL} onEnd={() => expire(b)} color="bg-brand"/>
              <div className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={b.c.name} size={44}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-body text-ink truncate">{b.c.name}</span>
                      {b.c.verified && <ShieldIcon size={12} className="text-brand flex-shrink-0"/>}
                      {b.rebid && <Badge label="New offer" color="purple"/>}
                    </div>
                    <div className="flex items-center gap-1.5 text-small text-muted mt-0.5 whitespace-nowrap">
                      <Rating value={b.c.rating}/><span>· {b.c.jobs} jobs</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-small text-muted mt-0.5 whitespace-nowrap">
                      <span className="flex items-center gap-0.5"><MapPinIcon size={10}/>{b.c.distanceKm} km</span>
                      <span className="flex items-center gap-0.5"><ClockIcon size={10}/>{b.c.etaMin} min</span>
                      <span className={`flex items-center gap-0.5 ${toolsWarn ? 'text-warn-ink font-bold' : 'text-brand'}`}><ToolIcon size={10}/>{b.c.hasTools ? 'Tools' : 'No tools'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="display text-lg text-ink leading-tight">{rs(b.amount)}</div>
                    <div className="text-tab text-subtle">{job.payType === 'hourly' ? 'per hour' : 'total'}</div>
                    <span className={`inline-block mt-0.5 text-tab font-bold px-1.5 py-0.5 rounded-full ${diff > 0 ? 'bg-warn text-warn-ink' : diff < 0 ? 'bg-mint text-brand' : 'bg-divider text-muted'}`}>
                      {diff === 0 ? 'Your price' : `${diff > 0 ? '+' : ''}${diff}%`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2.5">
                  <Button variant="secondary" size="md" className="flex-1" onClick={() => reject(b)}>Decline</Button>
                  <Button size="md" className="flex-[2]" onClick={() => { setSelected(b); setSheetStep('confirm') }}>
                    Accept · {rs(totalFor(job, b.amount))}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom sheet — job summary + search status */}
      <div className="absolute left-0 right-0 bottom-0 bg-surface rounded-t-3xl shadow-[0_-8px_24px_rgb(16_35_29_/_0.10)] px-5 pt-3 pb-6 z-10">
        <div className="w-10 h-1 bg-line rounded-full mx-auto mb-3"/>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-mint rounded-tile flex items-center justify-center text-2xl text-brand"><Glyph e={jobEmoji(job)}/></span>
          <div className="flex-1 min-w-0">
            <div className="display text-ink truncate">{jobTitle(job)}</div>
            <div className="text-small text-muted truncate">{hours}h · {job.dateLabel}, {job.time} · {job.area.split(',')[0]}</div>
          </div>
          <div className="text-right">
            <div className="text-tab text-subtle font-bold">Your offer</div>
            <div className="display text-brand text-body">{rs(offer)}{job.payType === 'hourly' ? '/hr' : ''}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider">
          <div className="flex items-center gap-2 text-body font-bold text-ink">
            <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"/>
            {bids.length
              ? `${bids.length} live offer${bids.length > 1 ? 's' : ''} · pick one`
              : streamDone ? 'Waiting for more offers…' : 'Finding workers near you…'}
          </div>
          <button onClick={() => setConfirmCancel(true)} className="text-small font-bold text-danger">Cancel</button>
        </div>
      </div>

      {/* Confirm worker → payment method */}
      <Sheet open={!!selected} onClose={() => {
        if (assigning || !selected) return
        const b = selected
        setSelected(null)
        selectedRef.current = null
        if (expiredWhileOpen.current === b.id) { expiredWhileOpen.current = null; expire(b) }
      }} title={sheetStep === 'confirm' ? 'Confirm worker' : 'Payment method'}>
        {selected && sheetStep === 'confirm' && (
          <div className="anim-fade-in">
            <div className="flex items-center gap-3 p-4 bg-canvas rounded-card">
              <Avatar name={selected.c.name} size={56}/>
              <div className="flex-1">
                <div className="display text-ink">{selected.c.name}</div>
                <div className="flex items-center gap-1.5"><Rating value={selected.c.rating}/><span className="text-small text-subtle">· {selected.c.jobs} completed jobs</span></div>
                <div className="flex gap-1 mt-1"><Badge label="ID verified" color="green"/>{selected.c.hasTools && <Badge label="Own tools" color="blue"/>}</div>
              </div>
            </div>
            <div className="mt-4">
              <Row label="Service" value={jobTitle(job)}/>
              <Row label="Agreed rate" value={`${rs(selected.amount)}${unit}`}/>
              {job.payType === 'hourly' && <Row label="Duration" value={`${hours} hours`}/>}
              <Row label="Arrives in" value={`~${selected.c.etaMin} min`}/>
              <div className="border-t border-divider mt-1 pt-1"><Row label="Estimated total" value={rs(totalFor(job, selected.amount))} strong/></div>
            </div>
            {job.toolsRequired && !selected.c.hasTools && (
              <div className="mt-3 p-3 bg-warn rounded-tile text-small text-warn-ink font-bold"><Glyph e="⚠️"/> This worker doesn't have their own tools — you asked for a worker who brings tools.</div>
            )}
            <Button className="w-full mt-5" onClick={() => setSheetStep('payment')}>Continue to payment</Button>
          </div>
        )}
        {selected && sheetStep === 'payment' && (
          <div className="anim-fade-in">
            <div className="space-y-2">
              {PAYMENT_METHODS.map(p => (
                <button key={p.id} onClick={() => setMethod(p.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all ${method === p.id ? 'border-brand bg-mint' : 'border-line'}`}>
                  <span className="text-2xl"><Glyph e={p.icon}/></span>
                  <div className="flex-1"><div className="font-bold text-body text-ink">{p.label}</div><div className="text-small text-muted">{p.sub}</div></div>
                  <Radio checked={method === p.id}/>
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-canvas rounded-tile text-small text-muted">
              {method === 'cash' ? 'Pay the worker in cash once the job is done.' : 'You’ll confirm the payment after the worker finishes. Nothing is charged now.'}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setSheetStep('confirm')} disabled={assigning}>Back</Button>
              <Button className="flex-[2]" loading={assigning} onClick={assign}>{assigning ? 'Assigning…' : `Confirm & assign`}</Button>
            </div>
          </div>
        )}
      </Sheet>

      <Confirm
        open={confirmCancel}
        title="Cancel this request?"
        desc="Workers will stop sending offers. You can post the job again anytime."
        confirmLabel="Cancel request"
        danger
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => { setConfirmCancel(false); onCancel() }}
      />
    </div>
  )
}
