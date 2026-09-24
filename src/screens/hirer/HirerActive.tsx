import { useState } from 'react'
import { AppHeader, Avatar, Badge, BottomBar, Button, Check, Confirm, Label, MapView, PhotoThumb, Rating, Row, Sheet, StarInput, StatusBar } from '../../components/ui'
import { ChevronLeft, MapPinIcon, MessageIcon, PhoneIcon, CheckIcon, AlertCircle } from '../../components/Icons'
import { findSub, rs } from '../../data/catalog'
import { PAYMENT_METHODS } from '../../data/mock'
import { jobEmoji, jobHours, jobTitle, stepIndex, totalFor, unitLabel, WORK_STEPS, type WorkStatus } from '../../data/jobs'
import type { HirerJob } from './types'

const methodOf = (id?: string) => PAYMENT_METHODS.find(p => p.id === id) ?? PAYMENT_METHODS[0]

export function HirerAssignedScreen({ hj, onTrack, onMessage }: { hj: HirerJob; onTrack: () => void; onMessage: () => void }) {
  const w = hj.worker!
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar/>
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 pt-8 text-center">
        <div className="relative w-24 h-24 mb-5">
          <span className="radar-ring"/>
          <div className="absolute inset-0 bg-emerald-500 rounded-full flex items-center justify-center text-5xl anim-bounce-in shadow-xl shadow-emerald-200">🤝</div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Worker assigned!</h2>
        <p className="text-gray-500 text-sm mb-6">{w.name} has been notified and will start heading to you.</p>
        <div className="w-full bg-gray-50 rounded-2xl p-4 text-left">
          <div className="flex items-center gap-3">
            <Avatar name={w.name} size={52}/>
            <div className="flex-1">
              <div className="font-extrabold text-gray-900">{w.name}</div>
              <div className="flex items-center gap-1.5"><Rating value={w.rating}/><span className="text-xs text-gray-400">· {w.jobs} jobs</span></div>
            </div>
            <a href="tel:+923001234567" aria-label="Call" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"><PhoneIcon size={16} className="text-gray-700"/></a>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {[{ l: 'Date', v: hj.job.dateLabel }, { l: 'Time', v: hj.job.time }, { l: 'Est. total', v: rs(hj.total ?? 0) }].map(x => (
              <div key={x.l} className="bg-white rounded-xl p-2.5">
                <div className="font-bold text-gray-900 text-sm">{x.v}</div>
                <div className="text-[10px] text-gray-400">{x.l}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 px-1 text-xs">
            <span className="text-gray-500">Payment</span>
            <span className="font-bold text-gray-800">{methodOf(hj.paymentMethod).icon} {methodOf(hj.paymentMethod).label}</span>
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
    <div className="flex flex-col h-full bg-white relative">
      <MapView height={230}
        pins={[{ id: 'home', x: 52, y: 44, kind: 'home', label: 'You' }, { id: 'w', ...pos, kind: 'worker', label: w.name.split(' ').map(x => x[0]).join(''), active: true }]}
        route={idx < 2 ? [pos, { x: 52, y: 44 }] : undefined}>
        <div className="absolute top-0 left-0 right-0"><StatusBar/></div>
        <button onClick={onBack} aria-label="Back" className="absolute top-10 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <ChevronLeft size={18} className="text-gray-700"/>
        </button>
        {eta > 0 && (
          <div className="absolute top-10 right-4 bg-gray-900 text-white rounded-full px-3 py-2 shadow-md text-xs font-bold">ETA {eta} min</div>
        )}
      </MapView>

      <div className="flex-1 overflow-y-auto -mt-4 bg-white rounded-t-3xl relative">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3"/>
        <div className="px-5 pt-3 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-extrabold text-lg text-gray-900">{headline}</div>
              <div className="text-xs text-gray-500 truncate">{jobEmoji(job)} {jobTitle(job)} · {job.dateLabel}, {job.time}</div>
            </div>
            <Badge label={WORK_STEPS[idx].short} color={status === 'done' ? 'amber' : 'green'} dot/>
          </div>
          <div className="flex items-center mt-4">
            {WORK_STEPS.slice(0, 5).map((s, i) => (
              <div key={s.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${i < idx ? 'bg-emerald-500 border-emerald-500' : i === idx ? 'bg-white border-emerald-500' : 'bg-white border-gray-200'}`}>
                    {i < idx ? <CheckIcon size={11} className="text-white"/> : i === idx ? <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> : null}
                  </div>
                  <span className={`text-[9px] font-bold mt-1 ${i <= idx ? 'text-emerald-600' : 'text-gray-300'}`}>{s.short}</span>
                </div>
                {i < 4 && <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all ${i < idx ? 'bg-emerald-400' : 'bg-gray-100'}`}/>}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative">
            <Avatar name={w.name} size={50}/>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900">{w.name}</div>
            <div className="flex items-center gap-1.5"><Rating value={w.rating}/><span className="text-xs text-gray-400">· {w.jobs} jobs · {w.hasTools ? 'Own tools' : 'No tools'}</span></div>
          </div>
          <a href="tel:+923001234567" aria-label="Call" className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center"><PhoneIcon size={17} className="text-gray-700"/></a>
          <button onClick={onMessage} aria-label="Message" className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200"><MessageIcon size={17} className="text-white"/></button>
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <Label>Job details</Label>
          <div className="flex items-start gap-2 mb-2">
            <MapPinIcon size={15} className="text-emerald-500 mt-0.5"/>
            <div><div className="text-sm font-semibold text-gray-900">{job.address}</div><div className="text-xs text-gray-500">{job.area}</div></div>
          </div>
          {job.lines.map(l => <Row key={l.subId} label={findSub(l.subId)?.sub.name ?? ''} value={`${l.hours}h`}/>)}
          <p className="text-sm text-gray-600 mt-2">{job.description}</p>
          {job.photos.length > 0 && <div className="flex gap-2 mt-3">{job.photos.map((p, i) => <PhotoThumb key={i} src={p} size={52}/>)}</div>}
        </div>

        <div className="px-5 py-4">
          <Label>Payment</Label>
          <Row label="Agreed rate" value={`${rs(hj.unit ?? 0)}${unitLabel(job.payType)}`}/>
          <Row label="Method" value={`${methodOf(hj.paymentMethod).icon} ${methodOf(hj.paymentMethod).label}`}/>
          <Row label="Estimated total" value={rs(hj.total ?? 0)} strong/>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => setReport(true)} className="py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl">Report issue</button>
            <button onClick={() => setConfirmCancel(true)} disabled={idx >= 3} className="py-3 text-sm font-bold text-red-500 bg-red-50 rounded-xl disabled:opacity-40">Cancel job</button>
          </div>
        </div>
      </div>

      {status === 'done' && (
        <BottomBar>
          <Button className="w-full" onClick={onReview}>✅ Review & confirm completion</Button>
        </BottomBar>
      )}

      <Confirm open={confirmCancel} title="Cancel this job?" desc={`${w.name.split(' ')[0]} will be notified. Frequent cancellations may affect your account.`}
        confirmLabel="Yes, cancel" danger onCancel={() => setConfirmCancel(false)} onConfirm={() => { setConfirmCancel(false); onCancel() }}/>

      <Sheet open={report} onClose={() => setReport(false)} title="Report an issue">
        <div className="space-y-2">
          {['Worker is late', 'Worker asked for more money', 'Quality of work', 'Safety concern', 'Something else'].map(r => (
            <button key={r} onClick={() => { setReport(false); onReport(r) }} className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 text-left active:border-emerald-300">
              <AlertCircle size={18} className="text-gray-400"/><span className="text-sm font-semibold text-gray-800">{r}</span>
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
      <div className="flex flex-col h-full bg-white">
        <StatusBar/>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center text-5xl mb-5 anim-bounce-in shadow-xl shadow-amber-200">⭐</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Thanks for your review!</h2>
          <p className="text-gray-500 text-sm">Your feedback helps {w.name.split(' ')[0]} and the DoAura community.</p>
        </div>
        <div className="px-5 pb-8"><Button className="w-full" onClick={() => onDone(rating)}>Back to home</Button></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <AppHeader title={step === 1 ? 'Confirm completion' : `Rate ${w.name.split(' ')[0]}`} subtitle={jobTitle(job)} onBack={step === 1 ? onBack : () => setStep(1)} step={step} total={2}/>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 && (
          <div className="anim-fade-in">
            <div className="bg-emerald-50 rounded-2xl p-5 text-center mb-5">
              <div className="text-3xl mb-1">✅</div>
              <div className="font-extrabold text-emerald-800">{w.name} marked the job as done</div>
              <div className="text-xs text-emerald-700 mt-0.5">Please check the work before confirming</div>
            </div>
            <Label>Completed tasks</Label>
            <div className="space-y-1.5 mb-5">
              {job.lines.map(l => (
                <div key={l.subId} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><CheckIcon size={11} className="text-white"/></span>
                  <span className="flex-1 text-sm font-semibold text-gray-800">{findSub(l.subId)?.sub.name}</span>
                  <span className="text-xs text-gray-500">{l.hours}h</span>
                </div>
              ))}
            </div>
            <Row label="Agreed rate" value={`${rs(hj.unit ?? 0)}${unitLabel(job.payType)}`}/>
            {job.payType === 'hourly' && <Row label="Hours" value={`${jobHours(job)}h`}/>}
            <div className="border-t border-gray-100 mt-1 pt-1"><Row label="Amount to pay" value={rs(total)} strong/></div>

            {method.id === 'cash' ? (
              <button onClick={() => setPaid(p => !p)} className={`mt-5 w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${paid ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}>
                <Check checked={paid}/>
                <div><div className="font-bold text-sm text-gray-900">I paid {rs(total)} in cash</div><div className="text-xs text-gray-500">{w.name.split(' ')[0]} will confirm receipt</div></div>
              </button>
            ) : paid ? (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50 flex items-center gap-3 anim-fade-in">
                <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center anim-bounce-in"><CheckIcon size={16} className="text-white"/></span>
                <div><div className="font-bold text-sm text-emerald-700">Paid {rs(total)} via {method.label}</div><div className="text-xs text-gray-500">Receipt sent to your email</div></div>
              </div>
            ) : (
              <Button variant="dark" className="w-full mt-5" loading={paying} onClick={() => { setPaying(true); setTimeout(() => { setPaying(false); setPaid(true) }, 1500) }}>
                {method.icon} Pay {rs(total)} with {method.label}
              </Button>
            )}
            <button onClick={onReport} className="w-full mt-4 text-sm font-bold text-gray-500">Something wrong? Report an issue</button>
          </div>
        )}
        {step === 2 && (
          <div className="anim-fade-in text-center">
            <Avatar name={w.name} size={76}/>
            <div className="font-extrabold text-gray-900 text-lg mt-3">How did {w.name.split(' ')[0]} do?</div>
            <div className="text-sm text-gray-500 mb-5">{jobTitle(job)}</div>
            <StarInput value={rating} onChange={setRating}/>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {TAGS.map(t => {
                const on = tags.includes(t)
                return (
                  <button key={t} onClick={() => setTags(on ? tags.filter(x => x !== t) : [...tags, t])}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${on ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 text-gray-600'}`}>{t}</button>
                )
              })}
            </div>
            <textarea rows={3} placeholder={`Write a review for ${w.name.split(' ')[0]} (optional)`}
              className="w-full mt-5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400 resize-none"/>
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
