import { useEffect, useRef, useState, type ReactNode } from 'react'
import { TabBar, ToastView, ToneContext, useToast } from '../../components/ui'
import { HomeIcon, BriefcaseIcon, MessageIcon, BarChartIcon, UserIcon } from '../../components/Icons'
import { ChatScreen, ConversationList, useConversations } from '../../components/Chat'
import { OtpScreen, SignupScreen, type Profile } from '../auth/Auth'
import { DocumentsScreen, SkillsScreen, type Docs, type Skills } from './Onboarding'
import { WorkerHome, NewJobAlert } from './WorkerHome'
import { JobDetailScreen, JobsScreen } from './WorkerJobs'
import { ActiveJobScreen, AssignedScreen, CompletionFlow } from './WorkerActive'
import { EarningsScreen, WorkerProfile, toPayments } from './WorkerMore'
import type { Bid, HistoryItem, MyJob, WorkerTab } from './types'
import { DEMO_WORKER, WORKER_JOB_POOL } from '../../data/mock'
import { rs } from '../../data/catalog'
import { jobEmoji, jobHours, jobTitle, jobUnitPrice, nowTime, uid, unitLabel, WORK_STEPS, type Job, type WorkStatus } from '../../data/jobs'

interface Props {
  mode: 'login' | 'signup'
  profile?: Profile
  onSignOut: () => void
  /** Leave sign-up from its first step. */
  onCancel: () => void
  onRegistered: (p: Profile, password: string) => void
}

type Stage = 'signup' | 'otp' | 'documents' | 'skills' | 'app'

type Route =
  | { name: 'job' | 'assigned' | 'active' | 'complete' | 'chat'; id: string }
  | { name: 'edit-skills' }
  | { name: 'documents' }

type JobsTab = 'open' | 'active' | 'completed'

const HIRER_REPLIES = [
  'Great, thank you! 🙏',
  'The gate will be open, please come straight in.',
  'Sounds good 👍',
  'Please give me a call when you arrive.',
  'Perfect, see you soon.',
]
const QUICK_REPLIES = ["I'm on my way 🚶", "I've arrived 📍", 'Running 10 min late', 'Work is done ✅']

// Data for the demo worker account.
const DEMO_SKILLS: Skills = { lawn: { tools: true }, 'tree-trim': { tools: true }, 'garden-cleanup': { tools: false }, 'pipe-repair': { tools: true }, 'fan-install': { tools: false } }
const DEMO_DOCS: Docs = { cnicFront: { name: 'cnic_front.jpg' }, cnicBack: { name: 'cnic_back.jpg' }, license: { name: 'driving_licence.jpg' } }
const DEMO_HISTORY: HistoryItem[] = [
  { id: 'h1', title: 'Deep Cleaning', emoji: '🧹', area: 'F-8/3', daysAgo: 1, amount: 3200, rating: 5 },
  { id: 'h2', title: 'Light Installation', emoji: '⚡', area: 'G-11/2', daysAgo: 2, amount: 2800, rating: 4 },
  { id: 'h3', title: 'Leak Repair', emoji: '💧', area: 'DHA Phase 2', daysAgo: 3, amount: 5000, rating: 5 },
  { id: 'h4', title: 'Lawn Maintenance', emoji: '🌱', area: 'E-7', daysAgo: 5, amount: 4500, rating: 5 },
  { id: 'h5', title: 'Pipe Repair', emoji: '💧', area: 'I-8/4', daysAgo: 9, amount: 3000, rating: 5 },
]

const findPoolJob = (id: string) => WORKER_JOB_POOL.find(j => j.id === id)

export default function WorkerApp({ mode, profile: account, onSignOut, onCancel, onRegistered }: Props) {
  const isDemo = mode === 'login' && account?.email === DEMO_WORKER.email
  const [stage, setStage] = useState<Stage>(mode === 'login' ? 'app' : 'signup')
  const [profile, setProfile] = useState<Profile>(account ?? { name: '', email: '', phone: '', city: 'Islamabad' })
  const [password, setPassword] = useState('')
  const [docs, setDocs] = useState<Docs>(isDemo ? DEMO_DOCS : {})
  const [verification, setVerification] = useState<'pending' | 'verified'>('verified')
  const [skills, setSkills] = useState<Skills>(isDemo ? DEMO_SKILLS : {})
  const [history] = useState<HistoryItem[]>(isDemo ? DEMO_HISTORY : [])

  const [tab, setTab] = useState<WorkerTab>('home')
  const [jobsTab, setJobsTab] = useState<JobsTab>('open')
  const [stack, setStack] = useState<Route[]>([])
  const [online, setOnline] = useState(false)
  const [feed, setFeed] = useState<Job[]>([])
  const [bids, setBids] = useState<Record<string, Bid>>({})
  const [mine, setMine] = useState<Record<string, MyJob>>({})
  const [alert, setAlert] = useState<Job | null>(null)

  const { toast, show, hide } = useToast()
  const chat = useConversations(HIRER_REPLIES)
  const poolIdx = useRef(0)
  const stackRef = useRef(stack)
  stackRef.current = stack

  const top = stack[stack.length - 1]
  const push = (r: Route) => setStack(s => [...s, r])
  const pop = () => setStack(s => s.slice(0, -1))
  const replaceTop = (r: Route) => setStack(s => [...s.slice(0, -1), r])
  const goTab = (t: WorkerTab) => { setStack([]); setTab(t) }
  const goJobs = (t: JobsTab) => { setJobsTab(t); goTab('jobs') }

  // --- New jobs stream in while online -------------------------------------------------
  useEffect(() => {
    if (stage !== 'app' || !online) return
    if (poolIdx.current === 0) {
      setFeed(WORKER_JOB_POOL.slice(0, 2))
      poolIdx.current = 2
    }
    let t: ReturnType<typeof setTimeout>
    const schedule = (ms: number) => {
      t = setTimeout(() => {
        if (poolIdx.current >= WORKER_JOB_POOL.length) return
        const j = WORKER_JOB_POOL[poolIdx.current++]
        setFeed(f => [j, ...f])
        setAlert(a => a ?? j)
        schedule(25000)
      }, ms)
    }
    schedule(5000)
    return () => clearTimeout(t)
  }, [stage, online])

  // --- Document verification (simulated review) ---------------------------------------
  useEffect(() => {
    if (stage !== 'app' || verification !== 'pending') return
    const t = setTimeout(() => {
      setVerification('verified')
      show({ emoji: '✅', tone: 'success', title: 'You are verified!', desc: 'You can now bid on jobs' })
    }, 8000)
    return () => clearTimeout(t)
  }, [stage, verification, show])

  useEffect(() => {
    if (mode === 'login') show({ emoji: '👋', title: `Welcome back, ${profile.name.split(' ')[0]}`, desc: 'Go online to start receiving jobs' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Drop a route whose job/chat no longer exists (e.g. cancelled or completed).
  useEffect(() => {
    const t = stack[stack.length - 1]
    if (!t || !('id' in t)) return
    const ok = t.name === 'job' ? !!findPoolJob(t.id)
      : t.name === 'chat' ? !!chat.convos[t.id]
      : !!mine[t.id] && (t.name !== 'active' || mine[t.id].status !== 'completed')
    if (!ok) setStack(s => s.slice(0, -1))
  }, [stack, mine, chat.convos])

  const toggleOnline = (v: boolean) => {
    setOnline(v)
    if (!v) setAlert(null)
    show(v
      ? { emoji: '🟢', title: "You're online", desc: 'We’ll notify you about jobs near you' }
      : { emoji: '⚪', title: "You're offline", desc: "You won't receive new job requests" })
  }

  // --- Bidding (hirer response is simulated) ------------------------------------------
  const isOnJob = (id: string) => {
    const t = stackRef.current[stackRef.current.length - 1]
    return !!t && t.name === 'job' && t.id === id
  }

  const resolveBid = (job: Job, amount: number) => {
    // The simulated hirer accepts bids at (or within 5% of) their offer and declines higher ones.
    const accepted = amount <= jobUnitPrice(job) * 1.05
    if (!accepted) {
      setBids(b => ({ ...b, [job.id]: { ...b[job.id], status: 'rejected' } }))
      if (!isOnJob(job.id)) {
        show({ emoji: '↩️', tone: 'error', title: 'Bid declined', desc: `${jobTitle(job)} is still open`, action: { label: 'Re-bid', onClick: () => push({ name: 'job', id: job.id }) } })
      }
      return
    }
    setBids(b => ({ ...b, [job.id]: { ...b[job.id], status: 'accepted' } }))
    setMine(m => ({
      ...m,
      [job.id]: { job, unit: amount, status: 'assigned', paymentMethod: job.payType === 'fixed' ? 'jazzcash' : 'cash', hoursWorked: jobHours(job) },
    }))
    setFeed(f => f.filter(j => j.id !== job.id))
    chat.ensure(
      { id: job.id, title: jobTitle(job), emoji: jobEmoji(job), otherName: job.hirer.name, otherPhone: job.hirer.phone, status: 'Assigned' },
      [
        { id: uid(), from: 'system', text: `Bid accepted · ${rs(amount)}${unitLabel(job.payType)}`, time: nowTime() },
        { id: uid(), from: 'them', text: `Hi! Thanks for taking the job. The address is ${job.address}, ${job.area}.`, time: nowTime() },
      ],
    )
    if (isOnJob(job.id)) replaceTop({ name: 'assigned', id: job.id })
    else show({ emoji: '🎉', tone: 'success', title: 'Bid accepted!', desc: `You got ${jobTitle(job)}`, action: { label: 'View', onClick: () => push({ name: 'assigned', id: job.id }) } })
  }

  const placeBid = (job: Job, amount: number) => {
    setBids(b => ({ ...b, [job.id]: { amount, status: 'pending', history: [...(b[job.id]?.history ?? []), amount] } }))
    setTimeout(() => resolveBid(job, amount), 4000)
  }

  // --- Active job ----------------------------------------------------------------------
  const setStatus = (id: string, status: WorkStatus) => {
    setMine(m => ({ ...m, [id]: { ...m[id], status } }))
    const label = WORK_STEPS.find(s => s.key === status)!.label
    chat.setStatus(id, label)
    chat.push(id, 'system', `Status: ${label}`)
    show({ emoji: '📣', title: label, desc: 'The hirer has been notified' })
    if (status === 'arrived') setTimeout(() => chat.push(id, 'them', "Great, I'm coming to the door now."), 1800)
  }

  const finishWork = (id: string) => {
    if (mine[id].status !== 'done') setStatus(id, 'done')
    push({ name: 'complete', id })
  }

  const completeJob = (id: string, r: { hoursWorked: number; earned: number; rating: number }) => {
    setMine(m => ({ ...m, [id]: { ...m[id], status: 'completed', hoursWorked: r.hoursWorked, earned: r.earned, hirerRating: r.rating, completedAt: 'Today' } }))
    chat.setStatus(id, 'Completed')
    chat.push(id, 'system', `Job completed · ${rs(r.earned)} paid`)
    goJobs('completed')
    show({ emoji: '💰', tone: 'success', title: `+${rs(r.earned)} earned`, desc: 'Job moved to Completed' })
  }

  const cancelJob = (id: string) => {
    setMine(m => { const n = { ...m }; delete n[id]; return n })
    chat.setStatus(id, 'Cancelled')
    chat.push(id, 'system', 'You cancelled this job')
    goJobs('active')
    show({ emoji: '🚫', title: 'Job cancelled', desc: 'The hirer has been notified' })
  }

  // --- Derived ------------------------------------------------------------------------
  const all = Object.values(mine)
  const active = all.filter(m => m.status !== 'completed')
  const completed = all.filter(m => m.status === 'completed')
  const payments = toPayments(completed, history)
  const today = payments.filter(p => p.daysAgo === 0).reduce((a, p) => a + p.amount, 0)
  const week = payments.filter(p => p.daysAgo < 7).reduce((a, p) => a + p.amount, 0)
  const ratings = [...history.map(h => h.rating), ...completed.map(() => 5)]
  const rating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
  const convoList = Object.values(chat.convos).reverse()

  // --- Onboarding ----------------------------------------------------------------------
  if (stage !== 'app') {
    return (
      <ToneContext.Provider value="worker"><div className="relative flex flex-col h-full">
        {stage === 'signup' && <SignupScreen role="worker" step={1} total={4} initial={profile.email ? profile : undefined} onBack={onCancel} onNext={(p, pw) => { setProfile(p); setPassword(pw); setStage('otp') }}/>}
        {stage === 'otp' && <OtpScreen phone={profile.phone} step={2} total={4} onBack={() => setStage('signup')} onVerify={() => setStage('documents')}/>}
        {stage === 'documents' && <DocumentsScreen docs={docs} onChange={setDocs} step={3} total={4} onBack={() => setStage('otp')} onNext={() => setStage('skills')}/>}
        {stage === 'skills' && (
          <SkillsScreen value={skills} onChange={setSkills} step={4} total={4} onBack={() => setStage('documents')}
            onNext={() => { onRegistered(profile, password); setVerification('pending'); setStage('app'); show({ emoji: '👋', title: `Welcome, ${profile.name.split(' ')[0]}!`, desc: 'Go online to start receiving jobs' }) }}/>
        )}
        <ToastView toast={toast} onClose={hide}/>
      </div></ToneContext.Provider>
    )
  }

  // --- Main app ------------------------------------------------------------------------
  let content: ReactNode = null
  if (top) {
    if (top.name === 'job') {
      const job = feed.find(j => j.id === top.id) ?? findPoolJob(top.id)
      if (job) {
        content = (
          <JobDetailScreen
            key={job.id}
            job={job}
            bid={bids[job.id]}
            online={online}
            verified={verification === 'verified'}
            taken={false}
            onBack={pop}
            onBid={a => placeBid(job, a)}
            onSkip={pop}
            onGoOnline={() => toggleOnline(true)}
          />
        )
      }
    } else if (top.name === 'assigned' && mine[top.id]) {
      content = <AssignedScreen m={mine[top.id]} onView={() => replaceTop({ name: 'active', id: top.id })} onMessage={() => replaceTop({ name: 'chat', id: top.id })}/>
    } else if (top.name === 'active' && mine[top.id]) {
      const m = mine[top.id]
      content = m.status === 'completed' ? null : (
        <ActiveJobScreen m={m} onBack={pop} onStatus={s => setStatus(top.id, s)} onFinish={() => finishWork(top.id)}
          onMessage={() => push({ name: 'chat', id: top.id })} onCancel={() => cancelJob(top.id)}/>
      )
    } else if (top.name === 'complete' && mine[top.id]) {
      content = <CompletionFlow m={mine[top.id]} onBack={pop} onComplete={r => completeJob(top.id, r)}/>
    } else if (top.name === 'chat' && chat.convos[top.id]) {
      const id = top.id
      content = (
        <ChatScreen
          convo={chat.convos[id]}
          typing={!!chat.typing[id]}
          onBack={pop}
          onSend={(t, img) => chat.send(id, t, img)}
          onRead={() => chat.markRead(id)}
          quickReplies={QUICK_REPLIES}
          onViewJob={mine[id] && mine[id].status !== 'completed' ? () => push({ name: 'active', id }) : undefined}
        />
      )
    } else if (top.name === 'edit-skills') {
      content = <SkillsScreen value={skills} onChange={setSkills} onBack={pop} cta="Save skills" onNext={() => { pop(); show({ emoji: '🛠️', title: 'Skills updated', desc: 'Your job matches are refreshed' }) }}/>
    } else if (top.name === 'documents') {
      content = <DocumentsScreen docs={docs} onChange={setDocs} status={verification} onBack={pop} onNext={() => { pop(); show({ emoji: '📄', title: 'Documents saved' }) }}/>
    }
  }

  if (!content) {
    if (tab === 'home') {
      content = (
        <WorkerHome
          name={profile.name} online={online} onToggleOnline={toggleOnline} verification={verification}
          today={today} todayJobs={payments.filter(p => p.daysAgo === 0).length} week={week}
          feed={feed} bids={bids} active={active} skills={skills} unread={chat.unreadTotal}
          onOpenJob={id => push({ name: 'job', id })} onOpenActive={id => push({ name: 'active', id })}
          onTab={t => (t === 'jobs' ? goJobs('open') : goTab(t))} onDocuments={() => push({ name: 'documents' })}
        />
      )
    } else if (tab === 'jobs') {
      content = (
        <JobsScreen key={jobsTab} initialTab={jobsTab} feed={feed} bids={bids} active={active} completed={completed} history={history}
          online={online} skills={skills} onOpenJob={id => push({ name: 'job', id })} onOpenActive={id => push({ name: 'active', id })}
          onGoOnline={() => toggleOnline(true)}/>
      )
    } else if (tab === 'messages') {
      content = <ConversationList convos={convoList} onOpen={id => push({ name: 'chat', id })} emptyText="When a hirer accepts your bid, you can chat with them about the job here."/>
    } else if (tab === 'earnings') {
      content = <EarningsScreen completed={completed} history={history} onWithdraw={a => show({ emoji: '🏦', tone: 'success', title: `${rs(a)} sent to JazzCash`, desc: 'Arrives in a few minutes' })}/>
    } else {
      content = (
        <WorkerProfile profile={profile} skills={skills} verification={verification} online={online} onToggleOnline={toggleOnline}
          rating={rating} jobsDone={history.length + completed.length} onEditSkills={() => push({ name: 'edit-skills' })}
          onDocuments={() => push({ name: 'documents' })} onEarnings={() => goTab('earnings')} onSignOut={onSignOut}/>
      )
    }
  }

  const showAlert = alert && online && (!top || (top.name !== 'complete' && !(top.name === 'job' && top.id === alert.id)))

  return (
    <ToneContext.Provider value="worker"><div className="relative flex flex-col h-full">
      <div className="flex-1 overflow-hidden">{content}</div>
      {!top && (
        <TabBar
          active={tab}
          onSelect={id => (id === 'jobs' ? goJobs(jobsTab) : goTab(id as WorkerTab))}
          items={[
            { id: 'home', label: 'Home', Icon: HomeIcon },
            { id: 'jobs', label: 'Jobs', Icon: BriefcaseIcon, badge: active.length },
            { id: 'earnings', label: 'Earnings', Icon: BarChartIcon },
            { id: 'profile', label: 'Profile', Icon: UserIcon },
          ]}
        />
      )}
      {showAlert && (
        <NewJobAlert
          job={alert}
          canBid={verification === 'verified'}
          onDismiss={() => setAlert(null)}
          onView={() => { push({ name: 'job', id: alert.id }); setAlert(null) }}
          onAccept={() => { placeBid(alert, jobUnitPrice(alert)); push({ name: 'job', id: alert.id }); setAlert(null) }}
        />
      )}
      <ToastView toast={toast} onClose={hide}/>
    </div></ToneContext.Provider>
  )
}
