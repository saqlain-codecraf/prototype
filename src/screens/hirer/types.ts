import type { Job, WorkStatus } from '../../data/jobs'
import type { Candidate } from '../../data/mock'

export interface Place {
  id: string
  label: string
  icon: string
  line: string
  area: string
  lat?: number
  lng?: number
}

export type HirerJobStatus = 'searching' | WorkStatus | 'cancelled'

export interface HirerJob {
  id: string
  job: Job
  status: HirerJobStatus
  worker?: Candidate
  unit?: number
  paymentMethod?: string
  total?: number
  rating?: number
  postedAt: string
}

export interface ActivityItem {
  id: string
  emoji: string
  title: string
  desc: string
  time: string
}

export type HirerTab = 'home' | 'jobs' | 'messages' | 'profile'

export interface CreatePreset {
  categoryId?: string
  subId?: string
  promo?: string
}
