import { findCategory, findSub, rs } from './catalog'

export type PayType = 'hourly' | 'fixed'

export interface JobLine {
  subId: string
  hours: number
}

export interface Person {
  name: string
  rating: number
  jobs: number
  phone: string
}

export interface Job {
  id: string
  categoryId: string
  lines: JobLine[]
  address: string
  area: string
  distanceKm: number
  toolsRequired: boolean
  description: string
  photos: string[]
  dateLabel: string
  time: string
  payType: PayType
  fixedPrice: number
  /** Hirer's own hourly offer; falls back to the admin standard rates when absent. */
  hourlyRate?: number
  hirer: Person
  urgent?: boolean
}

// Worker life-cycle of an assigned job, shared by both apps.
export type WorkStatus = 'assigned' | 'on_way' | 'arrived' | 'started' | 'done' | 'completed'

export const WORK_STEPS: { key: WorkStatus; label: string; short: string }[] = [
  { key: 'assigned',  label: 'Job Assigned',     short: 'Assigned' },
  { key: 'on_way',    label: 'On the Way',       short: 'On Way' },
  { key: 'arrived',   label: 'Arrived at Site',  short: 'Arrived' },
  { key: 'started',   label: 'Work in Progress', short: 'Working' },
  { key: 'done',      label: 'Work Finished',    short: 'Finished' },
  { key: 'completed', label: 'Completed & Paid', short: 'Done' },
]

export const stepIndex = (s: WorkStatus) => WORK_STEPS.findIndex(x => x.key === s)

export const jobHours = (j: Pick<Job, 'lines'>) => j.lines.reduce((a, l) => a + l.hours, 0)

type Priced = Pick<Job, 'lines' | 'payType' | 'fixedPrice' | 'hourlyRate'>

/** Admin standard price for the requested lines (sum of sub-category rate × hours). */
export function standardEstimate(j: Pick<Job, 'lines'>) {
  return j.lines.reduce((a, l) => a + (findSub(l.subId)?.sub.price ?? 0) * l.hours, 0)
}

/** Admin standard hourly rate, averaged across the requested lines. */
export function standardHourly(j: Pick<Job, 'lines'>) {
  return Math.round(standardEstimate(j) / (jobHours(j) || 1) / 50) * 50
}

/** Estimated total: fixed budget, hirer's hourly rate × hours, or admin standard rates. */
export function jobEstimate(j: Priced) {
  if (j.payType === 'fixed') return j.fixedPrice
  if (j.hourlyRate) return j.hourlyRate * jobHours(j)
  return standardEstimate(j)
}

/** The "unit" a worker bids on: an hourly rate for hourly jobs, the total for fixed jobs. */
export function jobUnitPrice(j: Priced) {
  if (j.payType === 'fixed') return j.fixedPrice
  return j.hourlyRate ?? standardHourly(j)
}

export const unitLabel = (p: PayType) => (p === 'hourly' ? '/hr' : ' fixed')

export function totalFor(j: Pick<Job, 'lines' | 'payType'>, unit: number) {
  return j.payType === 'hourly' ? unit * jobHours(j) : unit
}

export function jobTitle(j: Pick<Job, 'lines'>) {
  const first = findSub(j.lines[0]?.subId ?? '')?.sub.name ?? 'Service'
  return j.lines.length > 1 ? `${first} +${j.lines.length - 1}` : first
}

export function jobEmoji(j: Pick<Job, 'categoryId'>) {
  return findCategory(j.categoryId)?.emoji ?? '🛠️'
}

export function jobCategoryName(j: Pick<Job, 'categoryId'>) {
  return findCategory(j.categoryId)?.name ?? ''
}

export function priceLine(j: Job) {
  return `${rs(jobUnitPrice(j))}${unitLabel(j.payType)}`
}

export const uid = () => Math.random().toString(36).slice(2, 9)

export function nowTime() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
