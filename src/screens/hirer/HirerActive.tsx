import { useState } from 'react'
import { AppHeader, Avatar, Badge, BottomBar, Button, Check, Confirm, Label, MapView, PhotoThumb, Rating, Row, Sheet, StarInput, StatusBar } from '../../components/ui'
import { ChevronLeft, MapPinIcon, MessageIcon, PhoneIcon, CheckIcon, AlertCircle, Glyph } from '../../components/Icons'
import { findSub, rs } from '../../data/catalog'
import { PAYMENT_METHODS } from '../../data/mock'
import { jobEmoji, jobHours, jobTitle, stepIndex, totalFor, unitLabel, WORK_STEPS, type WorkStatus } from '../../data/jobs'
import type { HirerJob } from './types'

const methodOf = (id?: string) => PAYMENT_METHODS.find(p => p.id === id) ?? PAYMENT_METHODS[0]

export function HirerAssignedScreen({ hj, onTrack, onMessage }: { hj: HirerJob; onTrack: () => void; onMessage: () => void }) {
  const w = hj.worker!
  return (
    <div className="flex flex-col h-full bg-surface">
      <StatusBar/>
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 pt-8 text-center">
        <div className="relative w-24 h-24 mb-5">
          <span className="radar-ring"/>
          <div className="absolute inset-0 bg-brand rounded-full flex items-center justify-center text-5xl anim-bounce-in"><Glyph e="🤝"/></div>
        </div>
        <h2 className="text-2xl display text-ink mb-1">Worker assigned!</h2>
        <p className="text-muted text-sm mb-6">{w.name} has been notified and will start heading to you.</p>
        <div className="w-full bg-canvas rounded-card p-4 text-left">
          <div className="flex items-center gap-3">
            <Avatar name={w.name} size={52}/>
            <div className="flex-1">
              <div className="display text-ink">{w.name}</div>
              <div className="flex items-center gap-1.5"><Rating value={w.rating}/><span className="text-xs text-subtle">· {w.jobs} jobs</span></div>
            </div>
            <a href="tel:+923001234567" aria-label="Call" className="w-10 h-10 bg-surface rounded-tile flex items-center justify-center"><PhoneIcon size={16} className="text-label"/></a>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {[{ l: 'Date', v: hj.job.dateLabel }, { l: 'Time', v: hj.job.time }, { l: 'Est. total', v: rs(hj.total ?? 0) }].map(x => (
              <div key={x.l} className="bg-surface rounded-tile p-2.5">
                <div className="font-bold text-ink text-sm">{x.v}</div>
                <div className="text-[10px] text-subtle">{x.l}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 px-1 text-xs">
            <span className="text-muted">Payment</span>
            <span className="font-bold text-ink">{methodOf(hj.paymentMethod).icon} {methodOf(hj.paymentMethod).label}</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 space-y-2.5">
        <Button className="w-full" onClick={onTrack}>Track job</Button>
        <Button variant="secondary" className="w-full" onClick={onMessage}><MessageIcon size={18}/> Message {w.name.split(' ')[0]}</Button>
      </div>
    </div>
  )
}

const WORKER_POS: Record<string, { x: number; y: number }> = {
  assigned: { x: 20, y: 70 }, on_way: { x: 36, y: 50 }, arrived: { x: 47, y: 44 }, started: { x: 47, y: 44 }, done: { x: 47, y: 44 },
}

export function HirerActiveScreen({ hj, onBack, onMessage, onCancel, onReview, onReport }: {
  hj: HirerJob
  onBack: () => void
  onMessage: () => void
  onCancel: () => void
  onReview: () => void
  onReport: (reason: string) => void
}) {
  const { job } = hj
  const w = hj.worker!
  const status = hj.status as WorkStatus
  const idx = stepIndex(status)
  const pos = WORKER_POS[status] ?? WORKER_POS.done
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [report, setReport] = useState(false)
  const eta = status === 'assigned' ? w.etaMin : status === 'on_way' ? Math.max(3, Math.round(w.etaMin / 2)) : 0
  const headline = {
    assigned: `${w.name.split(' ')[0]} is getting ready`,
    on_way: `${w.name.split(' ')[0]} is on the way`,
    arrived: `${w.name.split(' ')[0]} has arrived`,
    started: 'Work in progress',
    done: 'Work finished — please confirm',
    completed: 'Completed',
  }[status]

  return (
    <div className="flex flex-col h-full bg-surface relative">
      <MapView height={230}
        pins={[{ id: 'home', x: 52, y: 44, kind: 'home', label: 'You' }, { id: 'w', ...pos, kind: 'worker', label: w.name.split(' ').map(x => x[0]).join(''), active: true }]}
        route={idx < 2 ? [pos, { x: 52, y: 44 }] : undefined}>
        <div className="absolute top-0 left-0 right-0"><StatusBar/></div>
        <button onClick={onBack} aria-label="Back" className="absolute top-10 left-4 w-10 h-10 bg-surface rounded-full flex items-center justify-center shadow-md">
          <ChevronLeft size={18} className="text-label"/>
        </button>
        {eta > 0 && (
          <div className="absolute top-10 right-4 bg-ink text-white rounded-full px-3 py-2 shadow-md text-xs font-bold">ETA {eta} min</div>
        )}
      </MapView>

      <div className="flex-1 overflow-y-auto -mt-4 bg-surface rounded-t-3xl relative">
        <div className="w-10 h-1 bg-line rounded-full mx-auto mt-3"/>
        <div className="px-5 pt-3 pb-4 border-b border-divider">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="display text-lg text-ink">{headline}</div>
              <div className="text-xs text-muted truncate"><Glyph e={jobEmoji(job)}/> {jobTitle(job)} · {job.dateLabel}, {job.time}</div>
            </div>
            <Badge label={WORK_STEPS[idx].short} color={status === 'done' ? 'amber' : 'green'} dot/>
          </div>
          <div className="flex items-center mt-4">
            {WORK_STEPS.slice(0, 5).map((s, i) => (
              <div key={s.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${i < idx ? 'bg-brand border-brand' : i === idx ? 'bg-surface border-brand' : 'bg-surface border-line'}`}>
                    {i < idx ? <CheckIcon size={11} className="text-white"/> : i === idx ? <span className="w-2 h-2 bg-brand rounded-full animate-pulse"/> : null}
                  </div>
                  <span className={`text-[9px] font-bold mt-1 ${i <= idx ? 'text-brand' : 'text-subtle'}`}>{s.short}</span>
                </div>
                {i < 4 && <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all ${i < idx ? 'bg-brand' : 'bg-divider'}`}/>}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-divider flex items-center gap-3">
          <div className="relative">
            <Avatar name={w.name} size={50}/>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-brand rounded-full border-2 border-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-ink">{w.name}</div>
            <div className="flex items-center gap-1.5"><Rating value={w.rating}/><span className="text-xs text-subtle">· {w.jobs} jobs · {w.hasTools ? 'Own tools' : 'No tools'}</span></div>
          </div>
          <a href="tel:+923001234567" aria-label="Call" className="w-11 h-11 bg-divider rounded-tile flex items-center justify-center"><PhoneIcon size={17} className="text-label"/></a>
          <button onClick={onMessage} aria-label="Message" className="w-11 h-11 bg-brand rounded-tile flex items-center justify-center"><MessageIcon size={17} className="text-white"/></button>
        </div>

        <div className="px-5 py-4 border-b border-divider">
          <Label>Job details</Label>
          <div className="flex items-start gap-2 mb-2">
            <MapPinIcon size={15} className="text-brand mt-0.5"/>
            <div><div className="text-sm font-semibold text-ink">{job.address}</div><div className="text-xs text-muted">{job.area}</div></div>
          </div>
          {job.lines.map(l => <Row key={l.subId} label={findSub(l.subId)?.sub.name ?? ''} value={`${l.hours}h`}/>)}
          <p className="text-sm text-muted mt-2">{job.description}</p>
          {job.photos.length > 0 && <div className="flex gap-2 mt-3">{job.photos.map((p, i) => <PhotoThumb key={i} src={p} size={52}/>)}</div>}
        </div>

        <div className="px-5 py-4">
          <Label>Payment</Label>
          <Row label="Agreed rate" value={`${rs(hj.unit ?? 0)}${unitLabel(job.payType)}`}/>
          <Row label="Method" value={`${methodOf(hj.paymentMethod).icon} ${methodOf(hj.paymentMethod).label}`}/>
          <Row label="Estimated total" value={rs(hj.total ?? 0)} strong/>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => setReport(true)} className="py-3 text-sm font-bold text-muted bg-divider rounded-tile">Report issue</button>
            <button onClick={() => setConfirmCancel(true)} disabled={idx >= 3} className="py-3 text-sm font-bold text-danger bg-danger-tint rounded-tile disabled:opacity-40">Cancel job</button>
          </div>
        </div>
      </div>

      {status === 'done' && (
        <BottomBar>
          <Button className="w-full" onClick={onReview}><Glyph e="✅"/> Review & confirm completion</Button>
        </BottomBar>
      )}

      <Confirm open={confirmCancel} title="Cancel this job?" desc={`${w.name.split(' ')[0]} will be notified. Frequent cancellations may affect your account.`}
        confirmLabel="Yes, cancel" danger onCancel={() => setConfirmCancel(false)} onConfirm={() => { setConfirmCancel(false); onCancel() }}/>

      <Sheet open={report} onClose={() => setReport(false)} title="Report an issue">
        <div className="space-y-2">
          {['Worker is late', 'Worker asked for more money', 'Quality of work', 'Safety concern', 'Something else'].map(r => (
            <button key={r} onClick={() => { setReport(false); onReport(r) }} className="w-full flex items-center gap-3 p-4 rounded-card border-2 border-divider text-left active:border-brand">
              <AlertCircle size={18} className="text-subtle"/><span className="text-sm font-semibold text-ink">{r}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}

const TAGS = ['On time', 'Professional', 'Great quality', 'Clean work', 'Friendly', 'Fair price']

export function HirerCompletionScreen({ hj, onBack, onDone, onReport }: {
  hj: HirerJob
  onBack: () => void
  onDone: (rating: number) => void
  onReport: () => void
}) {
  const { job } = hj
  const w = hj.worker!
  const method = methodOf(hj.paymentMethod)
  const total = totalFor(job, hj.unit ?? 0)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [paid, setPaid] = useState(false)
  const [paying, setPaying] = useState(false)
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState<string[]>([])

  if (step === 3) {
    return (
      <div className="flex flex-col h-full bg-surface">
        <StatusBar/>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-5xl mb-5 anim-bounce-in"><Glyph e="⭐"/></div>
          <h2 className="text-2xl display text-ink mb-1">Thanks for your review!</h2>
          <p className="text-muted text-sm">Your feedback helps {w.name.split(' ')[0]} and the DoAura community.</p>
        </div>
        <div className="px-5 pb-8"><Button className="w-full" onClick={() => onDone(rating)}>Back to home</Button></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <AppHeader title={step === 1 ? 'Confirm completion' : `Rate ${w.name.split(' ')[0]}`} subtitle={jobTitle(job)} onBack={step === 1 ? onBack : () => setStep(1)} step={step} total={2}/>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 && (
          <div className="anim-fade-in">
            <div className="bg-mint rounded-card p-5 text-center mb-5 text-brand">
              <div className="text-3xl mb-1"><Glyph e="✅"/></div>
              <div className="display text-brand">{w.name} marked the job as done</div>
              <div className="text-xs text-brand mt-0.5">Please check the work before confirming</div>
            </div>
            <Label>Completed tasks</Label>
            <div className="space-y-1.5 mb-5">
              {job.lines.map(l => (
                <div key={l.subId} className="flex items-center gap-2.5 bg-canvas rounded-tile px-3 py-2.5">
                  <span className="w-5 h-5 bg-brand rounded-full flex items-center justify-center"><CheckIcon size={11} className="text-white"/></span>
                  <span className="flex-1 text-sm font-semibold text-ink">{findSub(l.subId)?.sub.name}</span>
                  <span className="text-xs text-muted">{l.hours}h</span>
                </div>
              ))}
            </div>
            <Row label="Agreed rate" value={`${rs(hj.unit ?? 0)}${unitLabel(job.payType)}`}/>
            {job.payType === 'hourly' && <Row label="Hours" value={`${jobHours(job)}h`}/>}
            <div className="border-t border-divider mt-1 pt-1"><Row label="Amount to pay" value={rs(total)} strong/></div>

            {method.id === 'cash' ? (
              <button onClick={() => setPaid(p => !p)} className={`mt-5 w-full flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all ${paid ? 'border-brand bg-mint' : 'border-line'}`}>
                <Check checked={paid}/>
                <div><div className="font-bold text-sm text-ink">I paid {rs(total)} in cash</div><div className="text-xs text-muted">{w.name.split(' ')[0]} will confirm receipt</div></div>
              </button>
            ) : paid ? (
              <div className="mt-5 p-4 rounded-card bg-mint flex items-center gap-3 anim-fade-in text-brand">
                <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center anim-bounce-in"><CheckIcon size={16} className="text-white"/></span>
                <div><div className="font-bold text-sm text-brand">Paid {rs(total)} via {method.label}</div><div className="text-xs text-muted">Receipt sent to your email</div></div>
              </div>
            ) : (
              <Button variant="dark" className="w-full mt-5" loading={paying} onClick={() => { setPaying(true); setTimeout(() => { setPaying(false); setPaid(true) }, 1500) }}>
                <Glyph e={method.icon}/> Pay {rs(total)} with {method.label}
              </Button>
            )}
            <button onClick={onReport} className="w-full mt-4 text-sm font-bold text-muted">Something wrong? Report an issue</button>
          </div>
        )}
        {step === 2 && (
          <div className="anim-fade-in text-center">
            <Avatar name={w.name} size={76}/>
            <div className="display text-ink text-lg mt-3">How did {w.name.split(' ')[0]} do?</div>
            <div className="text-sm text-muted mb-5">{jobTitle(job)}</div>
            <StarInput value={rating} onChange={setRating}/>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {TAGS.map(t => {
                const on = tags.includes(t)
                return (
                  <button key={t} onClick={() => setTags(on ? tags.filter(x => x !== t) : [...tags, t])}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${on ? 'bg-brand border-brand text-white' : 'border-line text-muted'}`}>{t}</button>
                )
              })}
            </div>
            <textarea rows={3} placeholder={`Write a review for ${w.name.split(' ')[0]} (optional)`}
              className="w-full mt-5 px-4 py-3 bg-canvas border border-line rounded-tile text-sm outline-none focus:border-brand resize-none"/>
          </div>
        )}
      </div>
      <BottomBar>
        {step === 1 && <Button className="w-full" disabled={!paid} onClick={() => setStep(2)}>{paid ? 'Confirm completion' : 'Confirm payment first'}</Button>}
        {step === 2 && <Button className="w-full" disabled={!rating} onClick={() => setStep(3)}>Submit rating</Button>}
      </BottomBar>
    </div>
  )
}
