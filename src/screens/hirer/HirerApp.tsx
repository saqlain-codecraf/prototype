import { useEffect, useRef, useState, type ReactNode } from 'react'
import { TabBar, ToastView, ToneContext, useToast } from '../../components/ui'
import { HomeIcon, BriefcaseIcon, MessageIcon, UserIcon, PlusIcon } from '../../components/Icons'
import { ChatScreen, ConversationList, useConversations } from '../../components/Chat'
import { OtpScreen, SignupScreen, type Profile } from '../auth/Auth'
import { LocationPermission, LocationPickerScreen } from './Location'
import { HirerHome } from './HirerHome'
import { CreateJobScreen } from './CreateJob'
import { FindWorkersScreen } from './FindWorkers'
import { HirerActiveScreen, HirerAssignedScreen, HirerCompletionScreen } from './HirerActive'
import { ActivityScreen, HirerJobsScreen, HirerProfile } from './HirerMore'
import type { ActivityItem, CreatePreset, HirerJob, HirerTab, Place } from './types'
import { CANDIDATES, DEMO_HIRER, SAVED_PLACES, WORKER_JOB_POOL, type Candidate } from '../../data/mock'
import { rs } from '../../data/catalog'
import { jobTitle, jobEmoji, nowTime, totalFor, uid, unitLabel, WORK_STEPS, type Job, type WorkStatus } from '../../data/jobs'

interface Props {
  mode: 'login' | 'signup'
  profile?: Profile
  onSignOut: () => void
  /** Leave sign-up from its first step. */
  onCancel: () => void
  onRegistered: (p: Profile, password: string) => void
}

type Stage = 'signup' | 'otp' | 'app'

type Route =
  | { name: 'create'; preset: CreatePreset }
  | { name: 'finding' | 'assigned' | 'active' | 'complete' | 'chat'; id: string }
  | { name: 'location' }
  | { name: 'activity' }

const WORKER_REPLIES = ['Sure, no problem 👍', "I'll be there on time.", 'Noted, thank you!', 'Yes, I have all the tools needed.', 'On it!']
const QUICK_REPLIES = ['Where are you now?', 'The gate is open', 'Please call on arrival', 'Thank you! 🙏']

// The worker moves the job forward from the worker app. The two apps aren't connected in this
// prototype, so the hirer screen offers a clearly-labelled control that stands in for the worker's tap.
const WORKER_NEXT: Partial<Record<WorkStatus, { to: WorkStatus; label: string }>> = {
  assigned: { to: 'on_way', label: "I'm on my way" },
  on_way: { to: 'arrived', label: "I've arrived" },
  arrived: { to: 'started', label: 'Start work' },
  started: { to: 'done', label: 'Work finished' },
}

const DEMO_HISTORY: HirerJob[] = [
  { id: 'hx1', job: { ...WORKER_JOB_POOL[3], id: 'hx1', dateLabel: 'Last week' }, status: 'completed', worker: CANDIDATES[2], unit: 1000, paymentMethod: 'cash', total: 4000, rating: 5, postedAt: '' },
  { id: 'hx2', job: { ...WORKER_JOB_POOL[1], id: 'hx2', dateLabel: '3 days ago' }, status: 'completed', worker: CANDIDATES[1], unit: 1400, paymentMethod: 'jazzcash', total: 2800, rating: 4, postedAt: '' },
]

export default function HirerApp({ mode, profile: account, onSignOut, onCancel, onRegistered }: Props) {
  const isDemo = mode === 'login' && account?.email === DEMO_HIRER.email
  const [stage, setStage] = useState<Stage>(mode === 'login' ? 'app' : 'signup')
  const [profile, setProfile] = useState<Profile>(account ?? { name: '', email: '', phone: '', city: 'Islamabad' })
  const [password, setPassword] = useState('')
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [firstPicker, setFirstPicker] = useState(false)
  const [place, setPlace] = useState<Place>(SAVED_PLACES[0])

  const [tab, setTab] = useState<HirerTab>('home')
  const [stack, setStack] = useState<Route[]>([])
  const [jobs, setJobs] = useState<HirerJob[]>(isDemo ? DEMO_HISTORY : [])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [seenActivity, setSeenActivity] = useState(0)

  const { toast, show, hide } = useToast()
  const chat = useConversations(WORKER_REPLIES)
  const stackRef = useRef(stack)
  stackRef.current = stack

  const top = stack[stack.length - 1]
  const push = (r: Route) => setStack(s => [...s, r])
  const pop = () => setStack(s => s.slice(0, -1))
  const replaceTop = (r: Route) => setStack(s => [...s.slice(0, -1), r])
  const goTab = (t: HirerTab) => { setStack([]); setTab(t) }

  const log = (emoji: string, title: string, desc: string) =>
    setActivity(a => [{ id: uid(), emoji, title, desc, time: nowTime() }, ...a])
  const update = (id: string, p: Partial<HirerJob>) => setJobs(js => js.map(j => (j.id === id ? { ...j, ...p } : j)))
  const viewing = (id: string) => {
    const t = stackRef.current[stackRef.current.length - 1]
    return !!t && 'id' in t && t.id === id && t.name !== 'chat'
  }

  // --- Worker progress: changes only when the worker updates it (no timers) -----------

  const advance = (hj: HirerJob, to: WorkStatus) => {
    update(hj.id, { status: to })
    const w = hj.worker!.name.split(' ')[0]
    const label = WORK_STEPS.find(s => s.key === to)!.label
    chat.setStatus(hj.id, label)
    const msgs: Partial<Record<WorkStatus, [string, string, string]>> = {
      on_way: ['🚶', `${w} is on the way`, `I'm on my way, see you in about ${Math.round(hj.worker!.etaMin / 2)} minutes.`],
      arrived: ['📍', `${w} has arrived`, "I've arrived at your location."],
      started: ['🛠️', `${w} started work`, 'Starting the work now.'],
      done: ['✅', `${w} finished the job`, 'All done! Please check the work and confirm.'],
    }
    const m = msgs[to]
    if (!m) return
    chat.push(hj.id, 'them', m[2])
    log(m[0], m[1], jobTitle(hj.job))
    if (to === 'done') {
      show({ emoji: '✅', title: 'Work finished', desc: 'Review, pay & rate', action: { label: 'Review', onClick: () => push({ name: 'complete', id: hj.id }) } })
    } else if (!viewing(hj.id)) {
      show({ emoji: m[0], title: m[1], desc: jobTitle(hj.job), action: { label: 'Track', onClick: () => push({ name: 'active', id: hj.id }) } })
    }
  }

  // --- Job lifecycle -------------------------------------------------------------------
  const postJob = (job: Job) => {
    const hj: HirerJob = { id: job.id, job, status: 'searching', postedAt: nowTime() }
    setJobs(js => [hj, ...js])
    log('📝', 'Job posted', `${jobTitle(job)} · ${job.area}`)
    replaceTop({ name: 'finding', id: job.id })
  }

  const assign = (id: string, c: Candidate, unit: number, method: string) => {
    const hj = jobs.find(j => j.id === id)!
    const total = totalFor(hj.job, unit)
    update(id, { status: 'assigned', worker: c, unit, paymentMethod: method, total })
    chat.ensure(
      { id, title: jobTitle(hj.job), emoji: jobEmoji(hj.job), otherName: c.name, otherPhone: '+92 300 1234567', status: 'Assigned' },
      [
        { id: uid(), from: 'system', text: `You hired ${c.name} · ${rs(unit)}${unitLabel(hj.job.payType)}`, time: nowTime() },
        { id: uid(), from: 'them', text: `Hi ${profile.name.split(' ')[0]}! Thanks for choosing me. I'll be there ${hj.job.dateLabel.toLowerCase()} at ${hj.job.time}.`, time: nowTime() },
      ],
    )
    log('🤝', 'Worker assigned', `${c.name} · ${rs(total)} est.`)
    replaceTop({ name: 'assigned', id })
  }

  const cancel = (id: string, searching: boolean) => {
    update(id, { status: 'cancelled' })
    chat.setStatus(id, 'Cancelled')
    log('🚫', searching ? 'Request cancelled' : 'Job cancelled', jobTitle(jobs.find(j => j.id === id)!.job))
    setStack([])
    show({ emoji: '🚫', title: searching ? 'Request cancelled' : 'Job cancelled' })
  }

  const complete = (id: string, rating: number) => {
    const hj = jobs.find(j => j.id === id)!
    update(id, { status: 'completed', rating })
    chat.setStatus(id, 'Completed')
    chat.push(id, 'system', `Job completed · you rated ${rating}★`)
    log('💰', 'Payment confirmed', `${rs(hj.total ?? 0)} to ${hj.worker!.name}`)
    log('⭐', 'Review submitted', `You rated ${hj.worker!.name} ${rating} stars`)
    goTab('home')
  }

  const report = (reason: string) => {
    log('🛟', 'Issue reported', reason)
    show({ emoji: '🛟', title: 'Report sent', desc: 'Doaura support will contact you shortly' })
  }

  const openJob = (hj: HirerJob) => {
    if (hj.status === 'searching') push({ name: 'finding', id: hj.id })
    else if (hj.status === 'done') push({ name: 'complete', id: hj.id })
    else push({ name: 'active', id: hj.id })
  }

  // --- Auth ---------------------------------------------------------------------------
  if (stage !== 'app') {
    return (
      <ToneContext.Provider value="hirer"><div className="relative flex flex-col h-full">
        {stage === 'signup' && <SignupScreen role="hirer" step={1} total={2} initial={profile.email ? profile : undefined} onBack={onCancel} onNext={(p, pw) => { setProfile(p); setPassword(pw); setStage('otp') }}/>}
        {stage === 'otp' && <OtpScreen phone={profile.phone} step={2} total={2} onBack={() => setStage('signup')} onVerify={() => { onRegistered(profile, password); setStage('app') }}/>}
        <ToastView toast={toast} onClose={hide}/>
      </div></ToneContext.Provider>
    )
  }

  // --- Main ---------------------------------------------------------------------------
  const byId = (id: string) => jobs.find(j => j.id === id)
  const active = jobs.filter(j => !['completed', 'cancelled'].includes(j.status))
  const history = jobs.filter(j => ['completed', 'cancelled'].includes(j.status))
  const convoList = Object.values(chat.convos).reverse()

  let content: ReactNode = null
  if (top) {
    if (top.name === 'create') {
      content = <CreateJobScreen preset={top.preset} place={place} gpsAllowed={permission === 'granted'} hirer={profile} onBack={pop} onPost={postJob}/>
    } else if (top.name === 'location') {
      content = <LocationPickerScreen initial={place} gpsAllowed={permission === 'granted'} onBack={pop}
        onConfirm={p => { setPlace(p); pop(); show({ emoji: '📍', title: 'Work location updated', desc: p.area }) }}/>
    } else if (top.name === 'activity') {
      content = <ActivityScreen items={activity} onBack={pop}/>
    } else if (top.name === 'chat') {
      const c = chat.convos[top.id]
      const hj = byId(top.id)
      if (c) {
        content = (
          <ChatScreen convo={c} typing={!!chat.typing[top.id]} onBack={pop}
            onSend={(t, img) => chat.send(top.id, t, img)} onRead={() => chat.markRead(top.id)} quickReplies={QUICK_REPLIES}
            onViewJob={hj && !['completed', 'cancelled'].includes(hj.status) ? () => openJob(hj) : undefined}/>
        )
      }
    } else {
      const hj = byId(top.id)
      if (hj) {
        const id = hj.id
        if (hj.status === 'searching') {
          content = <FindWorkersScreen key={id} hj={hj} onBack={pop} onCancel={() => cancel(id, true)} onAssign={(c, u, m) => assign(id, c, u, m)}/>
        } else if (top.name === 'assigned') {
          content = <HirerAssignedScreen hj={hj} onTrack={() => replaceTop({ name: 'active', id })} onMessage={() => replaceTop({ name: 'chat', id })}/>
        } else if (top.name === 'complete' && hj.status === 'done') {
          content = <HirerCompletionScreen hj={hj} onBack={pop} onDone={r => complete(id, r)} onReport={() => report('Problem with completed work')}/>
        } else if (!['completed', 'cancelled'].includes(hj.status)) {
          const next = WORKER_NEXT[hj.status as WorkStatus]
          content = <HirerActiveScreen hj={hj} onBack={pop} onMessage={() => push({ name: 'chat', id })} onCancel={() => cancel(id, false)}
            onReview={() => push({ name: 'complete', id })} onReport={report}
            workerAction={next && { label: next.label, onClick: () => advance(hj, next.to) }}/>
        }
      }
    }
  }

  const routed = !!content
  if (!content) {
    if (tab === 'home') {
      content = (
        <HirerHome name={profile.name} place={place} active={active} recent={history.filter(h => h.status === 'completed')}
          unread={activity.length - seenActivity} offers={0}
          onChangeLocation={() => push({ name: 'location' })} onCreate={p => push({ name: 'create', preset: p })}
          onOpenJob={openJob} onNotifications={() => { setSeenActivity(activity.length); push({ name: 'activity' }) }} onProfile={() => goTab('profile')}/>
      )
    } else if (tab === 'jobs') {
      content = <HirerJobsScreen active={active} history={history} onOpen={openJob} onCreate={() => push({ name: 'create', preset: {} })}/>
    } else if (tab === 'messages') {
      content = <ConversationList convos={convoList} onOpen={id => push({ name: 'chat', id })} emptyText="Once you hire a worker, you can chat with them about the job here."/>
    } else {
      content = <HirerProfile profile={profile} place={place} posted={jobs.length} completed={history.filter(h => h.status === 'completed').length}
        onLocation={() => push({ name: 'location' })} onSignOut={onSignOut}/>
    }
  }

  return (
    <ToneContext.Provider value="hirer"><div className="relative flex flex-col h-full">
      <div className="flex-1 overflow-hidden relative">{content}</div>
      {!routed && (
        <TabBar
          active={tab}
          onSelect={id => (id === 'create' ? push({ name: 'create', preset: {} }) : goTab(id as HirerTab))}
          items={[
            { id: 'home', label: 'Home', Icon: HomeIcon },
            { id: 'jobs', label: 'My jobs', Icon: BriefcaseIcon, badge: active.length },
            { id: 'messages', label: 'Messages', Icon: MessageIcon, badge: chat.unreadTotal },
            { id: 'profile', label: 'Profile', Icon: UserIcon },
          ]}
        />
      )}

      {permission === 'unknown' && (
        <LocationPermission
          onAllow={p => { setPermission('granted'); setPlace(p); setFirstPicker(true) }}
          onManual={() => { setPermission('denied'); setFirstPicker(true) }}
        />
      )}
      {firstPicker && (
        <LocationPickerScreen initial={place} gpsAllowed={permission === 'granted'} title="Where do you want work done?"
          onConfirm={p => { setPlace(p); setFirstPicker(false); show({ emoji: '👋', title: `Welcome, ${profile.name.split(' ')[0]}!`, desc: `Showing pros near ${p.area.split(',')[0]}` }) }}/>
      )}
      <ToastView toast={toast} onClose={hide}/>
    </div></ToneContext.Provider>
  )
}
