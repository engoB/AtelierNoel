import { getCategory } from '../content/categories'
import type { GiftWish } from '../types/domain'

const DAY_MS = 24 * 60 * 60 * 1000

export interface GiftSchedule {
  start: Date
  end: Date
  isLate: boolean
}

export interface ProgressSnapshot extends GiftSchedule {
  percent: number
  isStarted: boolean
  isComplete: boolean
  currentStepIndex: number
  currentStep: string
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

export function getGiftSchedule(registeredAt: string): GiftSchedule {
  const registered = new Date(registeredAt)
  const year = registered.getFullYear()
  const isAfterSeason = registered.getMonth() === 11 && registered.getDate() > 23
  const seasonYear = isAfterSeason ? year + 1 : year
  const decemberFirst = new Date(seasonYear, 11, 1)
  const end = new Date(seasonYear, 11, 23, 23, 59, 59, 999)
  const registeredDay = startOfLocalDay(registered)
  const start = registeredDay < decemberFirst || registeredDay > end ? decemberFirst : registeredDay
  const durationDays = Math.floor((startOfLocalDay(end).getTime() - start.getTime()) / DAY_MS) + 1

  return { start, end, isLate: durationDays <= 9 }
}

export function getProgressSnapshot(gift: GiftWish, now: Date): ProgressSnapshot {
  const schedule = getGiftSchedule(gift.registeredAt)
  const category = getCategory(gift.categoryId)
  const effectiveNow = gift.status === 'considering' && gift.pausedAt ? new Date(gift.pausedAt) : now
  const isStarted = effectiveNow >= schedule.start
  const isComplete = gift.status !== 'considering' && effectiveNow >= schedule.end
  const rawProgress = ((effectiveNow.getTime() - schedule.start.getTime()) / (schedule.end.getTime() - schedule.start.getTime())) * 100
  const percent = isComplete ? 100 : isStarted ? Math.max(0, Math.min(99, Math.round(rawProgress))) : 0
  const currentStepIndex = isComplete
    ? category.steps.length - 1
    : Math.min(category.steps.length - 1, Math.floor((percent / 100) * category.steps.length))

  return {
    ...schedule,
    percent,
    isStarted,
    isComplete,
    currentStepIndex,
    currentStep: gift.status === 'considering'
      ? 'Le Père Noël étudie la question'
      : isStarted ? category.steps[currentStepIndex] : 'En attente du 1er décembre',
  }
}

export function getDaysUntil(date: Date, target: Date): number {
  return Math.max(0, Math.ceil((startOfLocalDay(target).getTime() - startOfLocalDay(date).getTime()) / DAY_MS))
}
