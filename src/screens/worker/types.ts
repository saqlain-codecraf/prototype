import type { Job, WorkStatus } from '../../data/jobs'

export type BidStatus = 'pending' | 'rejected' | 'accepted'

export interface Bid {
  amount: number
  status: BidStatus
  history: number[]
}

export interface MyJob {
  job: Job
  /** Agreed unit price (per hour for hourly jobs, total for fixed). */
  unit: number
  status: WorkStatus
  paymentMethod: string
  hoursWorked: number
  earned?: number
  hirerRating?: number
  completedAt?: string
}

export interface HistoryItem {
  id: string
  title: string
  emoji: string
  area: string
  daysAgo: number
  amount: number
  rating: number
}

export type WorkerTab = 'home' | 'jobs' | 'messages' | 'earnings' | 'profile'
