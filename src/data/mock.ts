import type { Job } from './jobs'
import type { Account, Profile } from '../screens/auth/Auth'

export const DEMO_WORKER: Profile = { name: 'Ahmad Khan', email: 'ahmad@doaura.pk', phone: '+92 300 1234567', city: 'Islamabad' }
export const DEMO_HIRER: Profile = { name: 'Sarah Mirza', email: 'sarah@doaura.pk', phone: '+92 301 5550123', city: 'Islamabad' }

/** Demo logins; the account's role decides which app opens after login. */
export const DEMO_ACCOUNTS: Account[] = [
  { role: 'hirer', profile: DEMO_HIRER, password: 'doaura123' },
  { role: 'worker', profile: DEMO_WORKER, password: 'doaura123' },
]

// Jobs posted by hirers that stream into the worker feed while online.
export const WORKER_JOB_POOL: Job[] = [
  {
    id: 'j-lawn', categoryId: 'gardening',
    lines: [{ subId: 'lawn', hours: 2 }, { subId: 'tree-trim', hours: 1 }],
    address: 'House 14, Street 22', area: 'G-7/1, Islamabad', distanceKm: 1.8,
    toolsRequired: true,
    description: 'Front lawn (approx 40 sq m) needs mowing and edging. Two fruit trees in the backyard need trimming.',
    photos: ['🌿', '🌳'], dateLabel: 'Today', time: '10:00 AM',
    payType: 'hourly', fixedPrice: 0,
    hirer: { name: 'Sarah Mirza', rating: 4.8, jobs: 12, phone: '+92 301 5550123' },
    urgent: false,
  },
  {
    id: 'j-pipe', categoryId: 'plumbing',
    lines: [{ subId: 'pipe-repair', hours: 2 }],
    address: 'Flat 3B, Block C', area: 'F-8/2, Islamabad', distanceKm: 2.4,
    toolsRequired: true,
    description: 'Kitchen sink pipe is leaking under the cabinet. Water is pooling — please come soon.',
    photos: ['🚰'], dateLabel: 'Today', time: '12:00 PM',
    payType: 'hourly', fixedPrice: 0,
    hirer: { name: 'Bilal Ahmed', rating: 4.6, jobs: 5, phone: '+92 333 5550456' },
    urgent: true,
  },
  {
    id: 'j-fan', categoryId: 'electrical',
    lines: [{ subId: 'fan-install', hours: 1 }],
    address: 'House 7, Street 4', area: 'G-9/3, Islamabad', distanceKm: 3.1,
    toolsRequired: false,
    description: 'Install one ceiling fan in the bedroom. Fan and fittings are already bought.',
    photos: [], dateLabel: 'Tomorrow', time: '9:00 AM',
    payType: 'fixed', fixedPrice: 2500,
    hirer: { name: 'Hina Qureshi', rating: 4.9, jobs: 21, phone: '+92 300 5550789' },
  },
  {
    id: 'j-clean', categoryId: 'cleaning',
    lines: [{ subId: 'deep-clean', hours: 4 }],
    address: 'House 88, Street 10', area: 'E-11/2, Islamabad', distanceKm: 4.2,
    toolsRequired: true,
    description: '3-bedroom house deep clean before guests arrive. Bathrooms and kitchen are a priority.',
    photos: ['🛁', '🍳'], dateLabel: 'Tomorrow', time: '11:00 AM',
    payType: 'hourly', fixedPrice: 0,
    hirer: { name: 'Omar Farooq', rating: 4.7, jobs: 9, phone: '+92 321 5550111' },
  },
  {
    id: 'j-cleanup', categoryId: 'gardening',
    lines: [{ subId: 'garden-cleanup', hours: 2 }],
    address: 'House 2, Street 1', area: 'F-7/3, Islamabad', distanceKm: 2.9,
    toolsRequired: false,
    description: 'Clear dry leaves and branches after the storm. Rake and bags available at the house.',
    photos: ['🍂'], dateLabel: 'Today', time: '4:00 PM',
    payType: 'fixed', fixedPrice: 2200,
    hirer: { name: 'Ayesha Malik', rating: 5.0, jobs: 3, phone: '+92 345 5550222' },
    urgent: true,
  },
]

export interface Candidate {
  id: string
  name: string
  rating: number
  jobs: number
  distanceKm: number
  etaMin: number
  skills: string[]
  hasTools: boolean
  /** Multiplier applied to the job's unit price to produce this worker's bid. */
  bidFactor: number
  x: number
  y: number
  verified: boolean
}

// Nearby workers that send bids to the hirer, one by one.
export const CANDIDATES: Candidate[] = [
  { id: 'w1', name: 'Ahmad Khan',    rating: 4.9, jobs: 127, distanceKm: 1.2, etaMin: 9,  skills: ['Top rated', 'On time'],   hasTools: true,  bidFactor: 1.05, x: 24, y: 30, verified: true },
  { id: 'w2', name: 'Ali Raza',      rating: 4.8, jobs: 93,  distanceKm: 2.1, etaMin: 14, skills: ['Friendly', 'Fast'],        hasTools: true,  bidFactor: 0.95, x: 72, y: 24, verified: true },
  { id: 'w3', name: 'Fatima Hassan', rating: 4.7, jobs: 68,  distanceKm: 2.6, etaMin: 17, skills: ['Detail oriented'],         hasTools: false, bidFactor: 1.0,  x: 66, y: 66, verified: true },
  { id: 'w4', name: 'Usman Tariq',   rating: 4.6, jobs: 44,  distanceKm: 3.3, etaMin: 21, skills: ['Budget friendly'],         hasTools: true,  bidFactor: 0.9,  x: 18, y: 70, verified: true },
  { id: 'w5', name: 'Kamran Shah',   rating: 4.9, jobs: 210, distanceKm: 3.8, etaMin: 24, skills: ['Expert', '10+ yrs'],       hasTools: true,  bidFactor: 1.15, x: 84, y: 48, verified: true },
]

export interface DayOption {
  key: string
  dow: string
  day: number
  month: string
  label: string
}

export function nextDays(n = 14): DayOption[] {
  const out: DayOption[] = []
  const base = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const dow = d.toLocaleDateString('en-US', { weekday: 'short' })
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    out.push({
      key: d.toISOString().slice(0, 10),
      dow: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dow,
      day: d.getDate(),
      month,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dow}, ${d.getDate()} ${month}`,
    })
  }
  return out
}

export const TIME_SLOTS: { id: string; label: string; emoji: string; times: string[] }[] = [
  { id: 'morning',   label: 'Morning',   emoji: '🌅', times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'] },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️', times: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'] },
  { id: 'evening',   label: 'Evening',   emoji: '🌇', times: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'] },
]

export const SAVED_PLACES = [
  { id: 'home', label: 'Home', icon: '🏠', line: 'House 14, Street 22, G-7/1', area: 'G-7/1, Islamabad' },
  { id: 'office', label: 'Office', icon: '🏢', line: 'Plaza 5, Blue Area', area: 'Blue Area, Islamabad' },
  { id: 'parents', label: "Parents' house", icon: '👪', line: 'House 3, Street 9, F-10/4', area: 'F-10/4, Islamabad' },
]

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash after job', sub: 'Pay the worker directly', icon: '💵' },
  { id: 'jazzcash', label: 'JazzCash', sub: '•••• 4521', icon: '📱' },
  { id: 'easypaisa', label: 'Easypaisa', sub: '•••• 7788', icon: '💚' },
  { id: 'card', label: 'Debit / Credit card', sub: 'Visa •••• 1024', icon: '💳' },
]
