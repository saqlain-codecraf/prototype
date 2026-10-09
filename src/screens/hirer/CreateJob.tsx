import { useMemo, useState, type ReactNode } from 'react'
import { AppHeader, BottomBar, Button, Check, Chip, IconTile, Label, NumberStepper, PhotoPicker, PhotoThumb, Row } from '../../components/ui'
import { EditIcon, AlertCircle, ToolIcon, Glyph, CheckIcon } from '../../components/Icons'
import { CATEGORIES, findCategory, findSub, rs } from '../../data/catalog'
import { nextDays, PAYMENT_METHODS, TIME_SLOTS } from '../../data/mock'
import { standardEstimate, standardHourly, uid, type Job, type PayType } from '../../data/jobs'
import { LocationPickerBody } from './Location'
import type { CreatePreset, Place } from './types'

type StepKey = 'category' | 'services' | 'location' | 'details' | 'schedule' | 'payment' | 'review'

const STEP_TITLES: Record<StepKey, string> = {
  category: 'Choose a category',
  services: 'Select services',
  location: 'Confirm location',
  details: 'Job details',
  schedule: 'Date & time',
  payment: 'Payment type',
  review: 'Review & post',
}

const round100 = (n: number) => Math.round(n / 100) * 100

export function CreateJobScreen({ preset, place: initialPlace, gpsAllowed, hirer, onBack, onPost }: {
  preset: CreatePreset
  place: Place
  gpsAllowed: boolean
  hirer: { name: string; phone: string }
  onBack: () => void
  onPost: (job: Job) => void
}) {
  const presetCat = preset.subId ? findSub(preset.subId)?.category.id : preset.categoryId
  const steps: StepKey[] = presetCat
    ? ['services', 'location', 'details', 'schedule', 'payment', 'review']
    : ['category', 'services', 'location', 'details', 'schedule', 'payment', 'review']
  const days = useMemo(() => nextDays(14), [])

  const [i, setI] = useState(0)
  const [categoryId, setCategoryId] = useState(presetCat ?? '')
  const [lines, setLines] = useState<Record<string, number>>(preset.subId ? { [preset.subId]: 1 } : {})
  const [place, setPlace] = useState<Place>(initialPlace)
  const [detail, setDetail] = useState('')
  const [toolsRequired, setToolsRequired] = useState(true)
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [dateKey, setDateKey] = useState(days[0].key)
  const [slot, setSlot] = useState('morning')
  const [time, setTime] = useState('')
  const [payType, setPayType] = useState<PayType>('hourly')
  const [method, setMethod] = useState('cash')
  const [fixed, setFixed] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [posting, setPosting] = useState(false)

  const step = steps[i]
  const cat = findCategory(categoryId)
  const lineArr = Object.entries(lines).map(([subId, hours]) => ({ subId, hours }))
  const totalHours = lineArr.reduce((a, l) => a + l.hours, 0)
  const standardTotal = standardEstimate({ lines: lineArr })
  const stdRate = standardHourly({ lines: lineArr })
  const hourlyRate = rate ?? stdRate
  const rateMin = Math.max(300, Math.round((stdRate * 0.6) / 50) * 50)
  const rateMax = Math.round((stdRate * 2) / 50) * 50
  const hourlyEstimate = hourlyRate * totalHours
  const fixedPrice = fixed ?? Math.max(500, round100(standardTotal))
  const estimate = payType === 'hourly' ? hourlyEstimate : fixedPrice
  const rateDiff = stdRate ? Math.round(((hourlyRate - stdRate) / stdRate) * 100) : 0
  const day = days.find(d => d.key === dateKey)!

  const valid: Record<StepKey, boolean> = {
    category: !!categoryId,
    services: lineArr.length > 0,
    location: true,
    details: description.trim().length >= 10,
    schedule: !!time,
    payment: payType === 'hourly' || fixedPrice >= 500,
    review: true,
  }
  const hint: Partial<Record<StepKey, string>> = {
    services: 'Select at least one service',
    details: 'Add a short description (10+ characters)',
    schedule: 'Pick a start time',
  }

  const next = () => (i < steps.length - 1 ? setI(i + 1) : post())
  const back = () => (i === 0 ? onBack() : setI(i - 1))
  const goto = (k: StepKey) => setI(steps.indexOf(k))

  const post = () => {
    setPosting(true)
    const job: Job = {
      id: uid(),
      categoryId,
      lines: lineArr,
      address: detail.trim() ? `${detail.trim()}, ${place.line}` : place.line,
      area: place.area,
      distanceKm: 0,
      toolsRequired,
      description: description.trim(),
      photos,
      dateLabel: day.label,
      time,
      payType,
      fixedPrice,
      hourlyRate: payType === 'hourly' ? hourlyRate : undefined,
      paymentMethod: method,
      hirer: { name: hirer.name, rating: 4.8, jobs: 12, phone: hirer.phone },
    }
    setTimeout(() => onPost(job), 900)
  }

  const toggleSub = (id: string) => setLines(l => {
    const n = { ...l }
    if (n[id]) delete n[id]
    else n[id] = 1
    return n
  })

  return (
    <div className="flex flex-col h-full bg-surface">
      <AppHeader title={STEP_TITLES[step]} subtitle={cat?.name} onBack={back} step={i + 1} total={steps.length}/>

      <div className="flex-1 overflow-y-auto px-5 py-5" key={step}>
        {step === 'category' && (
          <div className="anim-fade-in">
            <h2 className="text-xl display text-ink mb-1">What do you need help with?</h2>
            <p className="text-muted text-body mb-5">Pick a category to see its services.</p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => { if (c.id !== categoryId) setLines({}); setCategoryId(c.id); setI(1) }}
                  className={`flex items-center gap-3 p-4 rounded-card border-2 transition-all active:scale-[0.97] text-left ${categoryId === c.id ? 'border-brand bg-mint' : 'border-line'}`}>
                  <span className="w-10 h-10 rounded-tile flex items-center justify-center text-xl bg-mint text-brand"><Glyph e={c.emoji}/></span>
                  <span className="font-bold text-body text-ink">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'services' && cat && (
          <div className="anim-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-card flex items-center justify-center text-2xl bg-mint text-brand"><Glyph e={cat.emoji}/></span>
              <div className="flex-1">
                <h2 className="text-xl display text-ink">{cat.name}</h2>
                <p className="text-muted text-small">Tick what you need and set the hours for each.</p>
              </div>
            </div>
            {preset.promo && preset.categoryId === cat.id && (
              <div className="mb-3 px-3 py-2 bg-warn text-warn-ink text-small font-bold rounded-tile"><Glyph e="⚡"/> {preset.promo} applied at checkout</div>
            )}
            <div className="space-y-2.5">
              {cat.subs.map(s => {
                const on = lines[s.id] !== undefined
                return (
                  <div key={s.id} className={`rounded-card border-2 transition-all ${on ? 'border-brand bg-mint/60' : 'border-line'}`}>
                    <button onClick={() => toggleSub(s.id)} className="w-full flex items-center gap-3 p-4 text-left">
                      <Check checked={on}/>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-body text-ink">{s.name}</div>
                        <div className="text-small text-muted">{s.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-body display text-ink">{rs(s.price)}</div>
                        <div className="text-tab text-subtle">per hour</div>
                      </div>
                    </button>
                    {on && (
                      <div className="flex items-center justify-between px-4 pb-3 -mt-1 anim-fade-in">
                        <span className="text-small font-bold text-muted">Hours needed</span>
                        <NumberStepper size="sm" value={lines[s.id]} onChange={v => setLines(l => ({ ...l, [s.id]: v }))} min={1} max={10} format={v => `${v}h`}/>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 'location' && (
          <div className="anim-fade-in">
            <h2 className="text-xl display text-ink mb-1">Where should the work be done?</h2>
            <p className="text-muted text-body mb-4">This can be different from where you are now.</p>
            <LocationPickerBody value={place} onChange={setPlace} detail={detail} onDetail={setDetail} gpsAllowed={gpsAllowed}/>
          </div>
        )}

        {step === 'details' && (
          <div className="anim-fade-in space-y-5">
            <div>
              <Label>Tools</Label>
              <button onClick={() => setToolsRequired(t => !t)} className={`w-full flex items-start gap-3 p-4 rounded-card border-2 text-left transition-all ${toolsRequired ? 'border-brand bg-mint' : 'border-line'}`}>
                <Check checked={toolsRequired}/>
                <div className="flex-1">
                  <div className="font-bold text-body text-ink flex items-center gap-1.5"><ToolIcon size={14}/> Worker must bring tools</div>
                  <div className="text-small text-muted mt-0.5">
                    {toolsRequired
                      ? `Only workers with: ${Array.from(new Set(lineArr.flatMap(l => findSub(l.subId)?.sub.tools ?? []))).slice(0, 4).join(', ')}`
                      : "Unticked — you'll provide the tools"}
                  </div>
                </div>
              </button>
            </div>
            <div>
              <Label>Describe the job</Label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                placeholder="What needs to be done? Mention size, materials, access (gate, floor), pets, etc."
                className="w-full px-4 py-3 bg-canvas border border-line rounded-tile text-body text-ink placeholder-subtle outline-none focus:border-brand focus:bg-surface resize-none"/>
              <div className="flex justify-between text-small mt-1">
                <span className={description.trim().length >= 10 ? 'text-brand' : 'text-subtle'}>{description.trim().length >= 10 ? '✓ Looks good' : 'At least 10 characters'}</span>
                <span className="text-subtle">{description.length}/500</span>
              </div>
            </div>
            <div>
              <Label>Photos (optional)</Label>
              <p className="text-small text-muted mb-2">Photos help workers bid accurately.</p>
              <PhotoPicker photos={photos} onChange={setPhotos}/>
            </div>
          </div>
        )}

        {step === 'schedule' && (
          <div className="anim-fade-in">
            <Label>Start date</Label>
            <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2">
              {days.map(d => (
                <button key={d.key} onClick={() => setDateKey(d.key)}
                  aria-pressed={dateKey === d.key}
                  className={`flex-shrink-0 w-[68px] py-3 rounded-card flex flex-col items-center border-2 transition-all ${dateKey === d.key ? 'bg-mint border-brand text-brand' : 'bg-surface border-line text-ink'}`}>
                  <span className={`text-small font-bold ${dateKey === d.key ? 'text-brand' : 'text-muted'}`}>{d.dow}</span>
                  <span className="display text-[24px] leading-tight">{d.day}</span>
                  <span className={`text-small ${dateKey === d.key ? 'text-brand' : 'text-muted'}`}>{d.month}</span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              <Label>Time slot</Label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {TIME_SLOTS.map(s => (
                  <button key={s.id} onClick={() => { setSlot(s.id); setTime('') }}
                    aria-pressed={slot === s.id}
                    className={`py-3 rounded-card border-2 flex flex-col items-center gap-1 transition-all ${slot === s.id ? 'border-brand bg-mint text-brand' : 'border-line bg-surface text-brand'}`}>
                    <Glyph e={s.emoji} size={24}/>
                    <span className="text-ui font-bold text-ink">{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.find(s => s.id === slot)!.times.map(t => (
                  <Chip key={t} selected={time === t} onClick={() => setTime(t)}>{t}</Chip>
                ))}
              </div>
            </div>

            <div className="mt-5 p-4 bg-canvas rounded-card flex items-center gap-3">
              <span className="text-2xl"><Glyph e="🗓️"/></span>
              <div className="flex-1">
                <div className="text-body font-bold text-ink">{day.label}{time ? ` · ${time}` : ''}</div>
                <div className="text-small text-muted">{totalHours} hour{totalHours > 1 ? 's' : ''} of work{time ? '' : ' · choose a start time'}</div>
              </div>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="anim-fade-in">
            <div className="grid grid-cols-2 gap-3 mb-5">
              {([
                { t: 'hourly', title: 'Hourly', desc: 'Pay for time worked', icon: '⏱' },
                { t: 'fixed', title: 'Fixed price', desc: 'One price for the job', icon: '🎯' },
              ] as const).map(o => (
                <button key={o.t} onClick={() => setPayType(o.t)}
                  className={`p-4 rounded-card border-2 text-left transition-all ${payType === o.t ? 'border-brand bg-mint' : 'border-line'}`}>
                  <div className="text-2xl mb-1"><Glyph e={o.icon}/></div>
                  <div className="font-bold text-ink">{o.title}</div>
                  <div className="text-small text-muted">{o.desc}</div>
                </button>
              ))}
            </div>

            {payType === 'hourly' ? (
              <div className="space-y-3">
                <div className="bg-canvas rounded-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Doaura standard rates</Label>
                    <span className="text-tab font-bold text-brand bg-mint px-2 py-0.5 rounded-full mb-2">Set by Doaura</span>
                  </div>
                  {lineArr.map(l => {
                    const s = findSub(l.subId)!.sub
                    return <Row key={l.subId} label={`${s.name} · ${l.hours}h`} value={`${rs(s.price)}/hr`}/>
                  })}
                  <div className="border-t border-line mt-2 pt-1"><Row label="Standard rate" value={`${rs(stdRate)}/hr`}/></div>
                </div>

                <div className="rounded-card p-4 border-2 border-brand bg-surface">
                  <div className="flex items-center justify-between">
                    <Label>Your hourly rate</Label>
                    {rate !== null && rate !== stdRate && (
                      <button onClick={() => setRate(null)} className="text-small font-bold text-brand mb-2">Use standard</button>
                    )}
                  </div>
                  <NumberStepper value={hourlyRate} onChange={v => setRate(v)} min={rateMin} max={rateMax} step={50} format={v => `${rs(v)}/hr`}/>
                  <div className="flex justify-center gap-2 mt-3">
                    {[0.9, 1, 1.1, 1.2].map(f => {
                      const v = Math.round((stdRate * f) / 50) * 50
                      return (
                        <Chip key={f} selected={hourlyRate === v} onClick={() => setRate(v)} className="px-3">
                          {f === 1 ? 'Standard' : `${f > 1 ? '+' : ''}${Math.round((f - 1) * 100)}%`}
                        </Chip>
                      )
                    })}
                  </div>
                  <div className={`mt-3 text-small text-center font-bold ${rateDiff < 0 ? 'text-warn-ink' : rateDiff > 0 ? 'text-brand' : 'text-muted'}`}>
                    {rateDiff < 0 ? `${Math.abs(rateDiff)}% below standard — fewer workers may respond`
                      : rateDiff > 0 ? `${rateDiff}% above standard — expect faster offers`
                      : 'Standard Doaura rate for these services'}
                  </div>
                  <div className="border-t border-divider mt-3 pt-1">
                    <Row label={`${rs(hourlyRate)} × ${totalHours}h`} value={rs(hourlyEstimate)} strong/>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-canvas rounded-card p-4">
                <Label>Your fixed budget</Label>
                <NumberStepper value={fixedPrice} onChange={v => setFixed(v)} min={500} max={100000} step={100} format={rs}/>
                <div className="text-center text-small text-muted mt-2">Suggested from standard rates: <b>{rs(round100(standardTotal))}</b></div>
              </div>
            )}

            <div className="mt-6">
              <Label>Payment method</Label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(p => {
                  const on = method === p.id
                  return (
                    <button key={p.id} onClick={() => setMethod(p.id)} aria-pressed={on}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-card border-2 text-left transition-all ${on ? 'border-brand bg-mint' : 'border-line bg-surface'}`}>
                      <IconTile size={44} tone={on ? 'surface' : 'mint'}><Glyph e={p.icon} size={22}/></IconTile>
                      <div className="flex-1 min-w-0"><div className="font-bold text-body text-ink">{p.label}</div><div className="text-small text-muted">{p.sub}</div></div>
                      <span className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 ${on ? 'bg-brand text-white' : 'border-2 border-line'}`}>{on && <CheckIcon size={14}/>}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 p-3 bg-mint rounded-tile text-brand">
              <AlertCircle size={16} className="text-brand mt-0.5 flex-shrink-0"/>
              <p className="text-small text-brand">
                This is an <b>estimate</b>. Workers send offers and the <b>final price</b> is the bid you accept.{' '}
                {method === 'cash' ? 'You pay the worker in cash after the job.' : 'Nothing is charged until the work is done and you confirm it.'}
              </p>
            </div>
          </div>
        )}

        {step === 'review' && cat && (
          <div className="anim-fade-in space-y-3">
            <ReviewCard title="Services" onEdit={() => goto('services')}>
              <div className="flex items-center gap-2 mb-2"><span className="text-xl"><Glyph e={cat.emoji}/></span><span className="font-bold text-ink">{cat.name}</span></div>
              {lineArr.map(l => <Row key={l.subId} label={findSub(l.subId)!.sub.name} value={`${l.hours}h`}/>)}
            </ReviewCard>
            <ReviewCard title="Location" onEdit={() => goto('location')}>
              <div className="text-body font-bold text-ink"><Glyph e="📍"/> {detail.trim() ? `${detail.trim()}, ` : ''}{place.line}</div>
              <div className="text-small text-muted">{place.area}</div>
            </ReviewCard>
            <ReviewCard title="Details" onEdit={() => goto('details')}>
              <div className="text-body text-ink"><Glyph e="🔧"/> {toolsRequired ? 'Worker brings tools' : "I'll provide tools"}</div>
              <p className="text-body text-muted mt-1.5 line-clamp-3">{description}</p>
              {photos.length > 0 && <div className="flex gap-2 mt-2">{photos.map((p, k) => <PhotoThumb key={k} src={p} size={48}/>)}</div>}
            </ReviewCard>
            <ReviewCard title="Schedule" onEdit={() => goto('schedule')}>
              <div className="text-body font-bold text-ink"><Glyph e="📅"/> {day.label} · {time}</div>
              <div className="text-small text-muted">{totalHours} hours estimated</div>
            </ReviewCard>
            <ReviewCard title="Payment" onEdit={() => goto('payment')}>
              {payType === 'hourly' && <Row label="Your hourly rate" value={`${rs(hourlyRate)}/hr`}/>}
              <Row label="Pay with" value={<span className="inline-flex items-center gap-1.5"><Glyph e={PAYMENT_METHODS.find(p => p.id === method)!.icon}/>{PAYMENT_METHODS.find(p => p.id === method)!.label}</span>}/>
              <Row label={payType === 'hourly' ? `Estimated · ${totalHours}h` : 'Fixed price'} value={rs(estimate)} strong/>
            </ReviewCard>
          </div>
        )}
      </div>

      <BottomBar>
        {step !== 'category' && lineArr.length > 0 && step !== 'review' && (
          <div className="flex items-center justify-between text-small mb-2.5">
            <span className="text-muted">{lineArr.length} service{lineArr.length > 1 ? 's' : ''} · {totalHours}h</span>
            <span className="text-muted">Est. <b className="text-ink">{rs(estimate)}</b></span>
          </div>
        )}
        {step !== 'category' && (
          <Button className="w-full" disabled={!valid[step]} loading={posting} onClick={next}>
            {step === 'review' ? (posting ? 'Posting…' : 'Post job & find workers') : valid[step] ? 'Continue' : hint[step] ?? 'Continue'}
          </Button>
        )}
        {step === 'category' && <div className="text-center text-small text-subtle">Tap a category to continue</div>}
      </BottomBar>
    </div>
  )
}

function ReviewCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="bg-canvas rounded-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-small font-bold text-subtle">{title}</span>
        <button onClick={onEdit} className="flex items-center gap-1 text-small font-bold text-brand"><EditIcon size={12}/> Edit</button>
      </div>
      {children}
    </div>
  )
}
