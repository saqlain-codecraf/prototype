import { useEffect, useState } from 'react'
import { AppHeader, Avatar, Badge, BottomBar, Button, Check, Chip, Confirm, Label, MapView, NumberStepper, PhotoPicker, PhotoThumb, Rating, Row, StarInput, StatusBar } from '../../components/ui'
import { ChevronLeft, MapPinIcon, MessageIcon, NavigateIcon, PhoneIcon, CheckIcon, ToolIcon, Glyph } from '../../components/Icons'
import { findSub, rs } from '../../data/catalog'
import { PAYMENT_METHODS } from '../../data/mock'
import { jobEmoji, jobHours, jobTitle, stepIndex, totalFor, unitLabel, WORK_STEPS, type WorkStatus } from '../../data/jobs'
import type { MyJob } from './types'

const methodLabel = (id: string) => PAYMENT_METHODS.find(p => p.id === id)?.label ?? 'Cash'

// ------------------------------------------------------------------
// Assigned celebration
// ------------------------------------------------------------------

export function AssignedScreen({ m, onView, onMessage }: { m: MyJob; onView: () => void; onMessage: () => void }) {
  const { job } = m
  return (
    <div className="flex flex-col h-full bg-surface">
      <StatusBar/>
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 pt-8 text-center">
        <div className="relative w-24 h-24 mb-5">
          <span className="radar-ring"/>
          <div className="absolute inset-0 bg-brand rounded-full flex items-center justify-center text-5xl anim-bounce-in"><Glyph e="🎉"/></div>
        </div>
        <h2 className="display text-[26px] text-ink mb-1">Job assigned to you!</h2>
        <p className="text-muted text-body mb-6">{job.hirer.name} accepted your bid of <b className="text-ink">{rs(m.unit)}{unitLabel(job.payType)}</b></p>

        <div className="w-full bg-canvas rounded-card p-4 text-left">
          <div className="flex items-center gap-3 pb-3 border-b border-line">
            <span className="w-12 h-12 bg-surface rounded-tile flex items-center justify-center text-2xl"><Glyph e={jobEmoji(job)}/></span>
            <div>
              <div className="display text-ink">{jobTitle(job)}</div>
              <div className="text-small text-muted">{jobHours(job)} hours · {job.toolsRequired ? 'Bring your tools' : 'Tools provided'}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3">
            <div className="bg-surface rounded-tile p-3">
              <div className="text-tab text-subtle font-bold">Date</div>
              <div className="font-bold text-ink text-body">{job.dateLabel}</div>
            </div>
            <div className="bg-surface rounded-tile p-3">
              <div className="text-tab text-subtle font-bold">Time</div>
              <div className="font-bold text-ink text-body">{job.time}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-surface rounded-tile p-3 mt-2">
            <MapPinIcon size={16} className="text-danger mt-0.5"/>
            <div>
              <div className="font-bold text-body text-ink">{job.address}</div>
              <div className="text-small text-muted">{job.area} · {job.distanceKm} km away</div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-mint rounded-tile p-3 mt-2 text-brand">
            <span className="text-body text-brand font-bold">You'll earn</span>
            <span className="display text-brand">{rs(totalFor(job, m.unit))}</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 space-y-2.5">
        <Button className="w-full" onClick={onView}>View job & start</Button>
        <Button variant="secondary" className="w-full" onClick={onMessage}><MessageIcon size={18}/> Message {job.hirer.name.split(' ')[0]}</Button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Active job
// ------------------------------------------------------------------

const NEXT: Partial<Record<WorkStatus, { label: string; next: WorkStatus; emoji: string }>> = {
  assigned: { label: "I'm on my way", next: 'on_way', emoji: '🚶' },
  on_way:   { label: "I've arrived", next: 'arrived', emoji: '📍' },
  arrived:  { label: 'Start work', next: 'started', emoji: '🛠️' },
}

export function ActiveJobScreen({ m, onBack, onStatus, onFinish, onMessage, onCancel }: {
  m: MyJob
  onBack: () => void
  onStatus: (s: WorkStatus) => void
  onFinish: () => void
  onMessage: () => void
  onCancel: () => void
}) {
  const { job } = m
  const idx = stepIndex(m.status)
  const next = NEXT[m.status]
  const [confirmCancel, setConfirmCancel] = useState(false)
  const workerPos = m.status === 'assigned' ? { x: 22, y: 64 } : m.status === 'on_way' ? { x: 48, y: 47 } : { x: 68, y: 43 }
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${job.address}, ${job.area}`)}`

  return (
    <div className="flex flex-col h-full bg-surface relative">
      <MapView
        height={210}
        pins={[{ id: 'me', ...workerPos, kind: 'me' }, { id: 'job', x: 70, y: 40, kind: 'job', label: 'Job site' }]}
        route={idx < 2 ? [workerPos, { x: 70, y: 40 }] : undefined}
      >
        <div className="absolute top-0 left-0 right-0"><StatusBar/></div>
        <button onClick={onBack} aria-label="Back" className="absolute top-10 left-4 size-touch bg-surface rounded-full flex items-center justify-center shadow-md">
          <ChevronLeft size={18} className="text-label"/>
        </button>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="absolute top-10 right-4 px-3 h-10 bg-brand text-white rounded-full flex items-center gap-1.5 shadow-md text-small font-bold">
          <NavigateIcon size={14}/> Navigate
        </a>
      </MapView>

      <div className="flex-1 overflow-y-auto -mt-4 bg-surface rounded-t-3xl relative">
        <div className="w-10 h-1 bg-line rounded-full mx-auto mt-3"/>
        <div className="px-5 pt-3 pb-4 border-b border-divider">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="display text-lg text-ink truncate">{jobTitle(job)}</div>
              <div className="text-small text-muted">{job.dateLabel} · {job.time} · {jobHours(job)}h</div>
            </div>
            <Badge label={WORK_STEPS[idx].short} color={idx >= 3 ? 'green' : 'blue'} dot/>
          </div>
        </div>

        {/* Hirer */}
        <div className="px-5 py-4 border-b border-divider flex items-center gap-3">
          <Avatar name={job.hirer.name} size={46} tone="blue"/>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-ink">{job.hirer.name}</div>
            <div className="flex items-center gap-1.5"><Rating value={job.hirer.rating}/><span className="text-small text-subtle">· Hirer</span></div>
          </div>
          <a href={`tel:${job.hirer.phone.replace(/\s/g, '')}`} aria-label="Call" className="w-11 h-11 bg-divider rounded-tile flex items-center justify-center">
            <PhoneIcon size={17} className="text-label"/>
          </a>
          <button onClick={onMessage} aria-label="Message" className="w-11 h-11 bg-brand rounded-tile flex items-center justify-center">
            <MessageIcon size={17} className="text-white"/>
          </button>
        </div>

        {/* Location */}
        <div className="px-5 py-4 border-b border-divider">
          <Label>Job location</Label>
          <div className="flex items-start gap-2.5">
            <MapPinIcon size={18} className="text-danger mt-0.5"/>
            <div className="flex-1">
              <div className="font-bold text-body text-ink">{job.address}</div>
              <div className="text-small text-muted">{job.area} · {job.distanceKm} km away</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 py-4 border-b border-divider">
          <Label>Job progress</Label>
          {WORK_STEPS.map((s, i) => {
            const done = i < idx
            const cur = i === idx
            return (
              <div key={s.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-brand border-brand' : cur ? 'bg-surface border-brand' : 'bg-surface border-line'}`}>
                    {done ? <CheckIcon size={12} className="text-white"/> : cur ? <span className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse"/> : null}
                  </div>
                  {i < WORK_STEPS.length - 1 && <div className={`w-0.5 h-5 ${done ? 'bg-brand' : 'bg-divider'}`}/>}
                </div>
                <div className={`text-body pt-0.5 ${cur ? 'font-bold text-ink' : done ? 'text-muted' : 'text-subtle'}`}>{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* Details */}
        <div className="px-5 py-4 border-b border-divider">
          <Label>Work details</Label>
          {job.lines.map(l => (
            <Row key={l.subId} label={findSub(l.subId)?.sub.name ?? ''} value={`${l.hours}h`}/>
          ))}
          <div className="flex items-center gap-2 mt-2 text-small">
            <ToolIcon size={13} className={job.toolsRequired ? 'text-accent' : 'text-subtle'}/>
            <span className={job.toolsRequired ? 'text-warn-ink font-bold' : 'text-muted'}>{job.toolsRequired ? 'Bring your own tools' : 'Hirer provides tools'}</span>
          </div>
          <p className="text-body text-muted mt-2 leading-relaxed">{job.description}</p>
          {job.photos.length > 0 && <div className="flex gap-2 mt-3">{job.photos.map((p, i) => <PhotoThumb key={i} src={p} size={56}/>)}</div>}
        </div>

        <div className="px-5 py-4">
          <Label>Payment</Label>
          <Row label="Agreed rate" value={`${rs(m.unit)}${unitLabel(job.payType)}`}/>
          <Row label="Payment method" value={methodLabel(m.paymentMethod)}/>
          <Row label="Estimated earning" value={rs(totalFor(job, m.unit))} strong/>
          <button onClick={() => setConfirmCancel(true)} className="w-full mt-4 py-3 text-body font-bold text-danger bg-danger-tint rounded-tile">
            Can't make it? Cancel job
          </button>
        </div>
      </div>

      <div className="px-5 pb-7 pt-3 border-t border-divider bg-surface">
        {next ? (
          <Button className="w-full" onClick={() => onStatus(next.next)}><Glyph e={next.emoji}/> {next.label}</Button>
        ) : (
          <Button className="w-full" onClick={onFinish}><Glyph e="✅"/> {m.status === 'started' ? 'Finish work' : 'Continue completion'}</Button>
        )}
        <div className="text-center text-small text-subtle mt-2">{job.hirer.name.split(' ')[0]} sees every status update live</div>
      </div>

      <Confirm
        open={confirmCancel}
        title="Cancel this job?"
        desc="Cancelling after being assigned can affect your rating. The hirer will be notified."
        confirmLabel="Yes, cancel"
        danger
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => { setConfirmCancel(false); onCancel() }}
      />
    </div>
  )
}

// ------------------------------------------------------------------
// Completion: confirm job list -> confirm payment -> rate hirer -> mark completed
// ------------------------------------------------------------------

const RATE_TAGS = ['Clear instructions', 'Friendly', 'Paid on time', 'Easy to find', 'Would work again']

export function CompletionFlow({ m, onBack, onComplete }: {
  m: MyJob
  onBack: () => void
  onComplete: (r: { hoursWorked: number; earned: number; rating: number }) => void
}) {
  const { job } = m
  const [step, setStep] = useState(1)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [photos, setPhotos] = useState<string[]>([])
  const [hours, setHours] = useState(jobHours(job))
  const [paid, setPaid] = useState(false)
  const [digitalState, setDigitalState] = useState<'waiting' | 'received'>('waiting')
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const final = job.payType === 'hourly' ? m.unit * hours : m.unit
  const isCash = m.paymentMethod === 'cash'
  const allChecked = job.lines.every(l => checked[l.subId])

  useEffect(() => {
    if (step !== 2 || isCash) return
    const t = setTimeout(() => { setDigitalState('received'); setPaid(true) }, 1800)
    return () => clearTimeout(t)
  }, [step, isCash])

  if (done) {
    return (
      <div className="flex flex-col h-full bg-surface">
        <StatusBar/>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center text-5xl mb-5 anim-bounce-in"><Glyph e="💰"/></div>
          <h2 className="display text-[26px] text-ink mb-1">Job completed!</h2>
          <p className="text-muted text-body mb-6">Great work. Your earnings have been updated.</p>
          <div className="w-full bg-mint rounded-card p-5 text-brand">
            <div className="text-body text-brand font-bold">Added to your earnings</div>
            <div className="display text-price text-brand mt-1">+{rs(final)}</div>
            <div className="text-small text-brand mt-1">{jobTitle(job)} · {methodLabel(m.paymentMethod)}</div>
          </div>
        </div>
        <div className="px-5 pb-8">
          <Button className="w-full" onClick={() => onComplete({ hoursWorked: hours, earned: final, rating })}>Done</Button>
        </div>
      </div>
    )
  }

  const titles = ['', 'Confirm job list', 'Confirm payment', 'Rate the hirer']

  return (
    <div className="flex flex-col h-full bg-surface">
      <AppHeader title={titles[step]} subtitle={jobTitle(job)} onBack={step === 1 ? onBack : () => setStep(step - 1)} step={step} total={3}/>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 && (
          <div className="anim-fade-in">
            <h2 className="text-xl display text-ink mb-1">Is everything done?</h2>
            <p className="text-body text-muted mb-4">Tick each task you completed. The hirer will see this list.</p>
            <div className="space-y-2">
              {job.lines.map(l => {
                const on = !!checked[l.subId]
                return (
                  <button key={l.subId} onClick={() => setChecked(c => ({ ...c, [l.subId]: !on }))}
                    className={`w-full flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all ${on ? 'border-brand bg-mint' : 'border-line'}`}>
                    <Check checked={on}/>
                    <div className="flex-1">
                      <div className="font-bold text-body text-ink">{findSub(l.subId)?.sub.name}</div>
                      <div className="text-small text-muted">{findSub(l.subId)?.sub.desc} · {l.hours}h planned</div>
                    </div>
                  </button>
                )
              })}
              <button onClick={() => setChecked(c => ({ ...c, cleanup: !c.cleanup }))}
                className={`w-full flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all ${checked.cleanup ? 'border-brand bg-mint' : 'border-line'}`}>
                <Check checked={!!checked.cleanup}/>
                <div className="font-bold text-body text-ink">Work area cleaned up</div>
              </button>
            </div>

            {job.payType === 'hourly' && (
              <div className="mt-5 bg-canvas rounded-card p-4">
                <Label>Hours actually worked</Label>
                <NumberStepper value={hours} onChange={setHours} min={1} max={12} format={v => `${v} hr${v > 1 ? 's' : ''}`}/>
                <div className="text-center text-small text-muted mt-2">{rs(m.unit)}/hr × {hours} = <b className="text-ink">{rs(final)}</b></div>
              </div>
            )}

            <div className="mt-5">
              <Label>After-work photos (optional)</Label>
              <PhotoPicker photos={photos} onChange={setPhotos}/>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="anim-fade-in">
            <div className="text-center bg-canvas rounded-sheet p-6 mb-5">
              <div className="text-small text-muted font-bold">Final amount</div>
              <div className="display text-price text-ink mt-1">{rs(final)}</div>
              <div className="text-small text-muted mt-1">{job.payType === 'hourly' ? `${rs(m.unit)}/hr × ${hours}h` : 'Fixed price'}</div>
            </div>
            <Row label="Hirer" value={job.hirer.name}/>
            <Row label="Payment method" value={methodLabel(m.paymentMethod)}/>
            <Row label="Platform fee" value="Rs 0 (promo)"/>
            <div className="border-t border-divider mt-1 pt-1"><Row label="You receive" value={rs(final)} strong/></div>

            {isCash ? (
              <button onClick={() => setPaid(p => !p)} className={`mt-5 w-full flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all ${paid ? 'border-brand bg-mint' : 'border-line'}`}>
                <Check checked={paid}/>
                <div>
                  <div className="font-bold text-body text-ink">I received {rs(final)} in cash</div>
                  <div className="text-small text-muted">Confirm only after you have the money</div>
                </div>
              </button>
            ) : (
              <div className={`mt-5 p-4 rounded-card flex items-center gap-3 transition-all ${digitalState === 'received' ? 'bg-mint' : 'bg-warn'}`}>
                {digitalState === 'received'
                  ? <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center anim-bounce-in"><CheckIcon size={16} className="text-white"/></span>
                  : <span className="w-8 h-8 border-[3px] border-accent border-t-transparent rounded-full animate-spin"/>}
                <div>
                  <div className={`font-bold text-body ${digitalState === 'received' ? 'text-brand' : 'text-warn-ink'}`}>
                    {digitalState === 'received' ? `Payment received via ${methodLabel(m.paymentMethod)}` : `Waiting for ${job.hirer.name.split(' ')[0]} to pay…`}
                  </div>
                  <div className="text-small text-muted">{digitalState === 'received' ? 'Transferred to your Doaura wallet' : 'Hirer was asked to confirm the payment'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="anim-fade-in text-center">
            <Avatar name={job.hirer.name} size={72} tone="blue"/>
            <div className="display text-ink text-lg mt-3">How was {job.hirer.name.split(' ')[0]}?</div>
            <div className="text-body text-muted mb-5">Your rating helps other workers.</div>
            <StarInput value={rating} onChange={setRating}/>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {RATE_TAGS.map(t => {
                const on = tags.includes(t)
                return (
                  <Chip key={t} selected={on} onClick={() => setTags(on ? tags.filter(x => x !== t) : [...tags, t])}>{t}</Chip>
                )
              })}
            </div>
            <textarea rows={3} placeholder="Add a comment (optional)"
              className="w-full mt-5 px-4 py-3 bg-canvas border border-line rounded-tile text-body outline-none focus:border-brand resize-none"/>
          </div>
        )}
      </div>
      <BottomBar>
        {step === 1 && <Button className="w-full" disabled={!allChecked} onClick={() => setStep(2)}>{allChecked ? 'Confirm job list' : 'Tick all tasks to continue'}</Button>}
        {step === 2 && <Button className="w-full" disabled={!paid} onClick={() => setStep(3)}>Confirm payment</Button>}
        {step === 3 && <Button className="w-full" disabled={!rating} onClick={() => setDone(true)}>Mark as completed</Button>}
      </BottomBar>
    </div>
  )
}
