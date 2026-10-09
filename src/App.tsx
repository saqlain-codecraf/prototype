import { useCallback, useState } from 'react'
import { LoginScreen, RolePicker, SplashScreen, type Account, type Profile, type Role } from './screens/auth/Auth'
import WorkerApp from './screens/worker/WorkerApp'
import HirerApp from './screens/hirer/HirerApp'
import { DEMO_ACCOUNTS } from './data/mock'

type Entry = 'splash' | 'login' | 'register'

/** A signed-in account, or a sign-up in progress for the chosen role. */
type Session = { mode: 'login'; account: Account } | { mode: 'signup'; role: Role }

export default function App() {
  const [entry, setEntry] = useState<Entry>('splash')
  const [session, setSession] = useState<Session | null>(null)
  const [accounts, setAccounts] = useState<Account[]>(DEMO_ACCOUNTS)

  const endSplash = useCallback(() => setEntry('login'), [])
  const signOut = () => { setSession(null); setEntry('login') }
  const cancelSignup = () => { setSession(null); setEntry('register') }
  const registered = (role: Role) => (profile: Profile, password: string) =>
    setAccounts(a => [...a.filter(x => x.profile.email !== profile.email), { role, profile, password }])

  let screen
  if (session?.mode === 'login') {
    const { role, profile } = session.account
    screen = role === 'worker'
      ? <WorkerApp key={profile.email} mode="login" profile={profile} onSignOut={signOut} onCancel={cancelSignup} onRegistered={registered('worker')}/>
      : <HirerApp key={profile.email} mode="login" profile={profile} onSignOut={signOut} onCancel={cancelSignup} onRegistered={registered('hirer')}/>
  } else if (session?.mode === 'signup') {
    screen = session.role === 'worker'
      ? <WorkerApp key="signup-worker" mode="signup" onSignOut={signOut} onCancel={cancelSignup} onRegistered={registered('worker')}/>
      : <HirerApp key="signup-hirer" mode="signup" onSignOut={signOut} onCancel={cancelSignup} onRegistered={registered('hirer')}/>
  } else if (entry === 'splash') {
    screen = <SplashScreen onDone={endSplash}/>
  } else if (entry === 'register') {
    screen = <RolePicker onBack={() => setEntry('login')} onContinue={role => setSession({ mode: 'signup', role })}/>
  } else {
    screen = <LoginScreen accounts={accounts} onLogin={account => setSession({ mode: 'login', account })} onRegister={() => setEntry('register')}/>
  }

  return (
    <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--color-ink)' }}>
      <div className="phone-frame relative bg-surface overflow-hidden flex flex-col">
        {screen}
      </div>
    </div>
  )
}
