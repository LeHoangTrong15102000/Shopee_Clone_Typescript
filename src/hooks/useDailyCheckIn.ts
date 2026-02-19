import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CheckInDay,
  CheckInStreak,
  CheckInState,
  DEFAULT_CHECKIN_CONFIG,
  getRewardForDay
} from 'src/types/checkin.type'

const CHECKIN_STORAGE_KEY = 'shopee_daily_checkin'
const COINS_STORAGE_KEY = 'shopee_user_coins'

interface StoredCheckInData {
  streak: CheckInStreak
  history: CheckInDay[]
  totalCoins: number
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

// Helper to check if two dates are consecutive
const areConsecutiveDays = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

// Helper to check if date is today
const isToday = (date: string): boolean => {
  return date === getTodayDate()
}

export const useDailyCheckIn = () => {
  const [state, setState] = useState<CheckInState>({
    streak: { current: 0, longest: 0, lastCheckIn: null },
    history: [],
    totalCoins: 0,
    canCheckInToday: true
  })

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CHECKIN_STORAGE_KEY)
    const storedCoins = localStorage.getItem(COINS_STORAGE_KEY)

    if (stored) {
      try {
        const data: StoredCheckInData = JSON.parse(stored)
        const today = getTodayDate()
        const canCheckIn = data.streak.lastCheckIn !== today

        // Check if streak is broken (more than 1 day since last check-in)
        let currentStreak = data.streak.current
        if (data.streak.lastCheckIn && !areConsecutiveDays(data.streak.lastCheckIn, today) && !isToday(data.streak.lastCheckIn)) {
          currentStreak = 0 // Reset streak if broken
        }

        setState({
          streak: { ...data.streak, current: currentStreak },
          history: data.history,
          totalCoins: storedCoins ? parseInt(storedCoins) : data.totalCoins,
          canCheckInToday: canCheckIn
        })
      } catch (e) {
        console.error('Failed to parse check-in data:', e)
        localStorage.removeItem(CHECKIN_STORAGE_KEY)
      }
    }
  }, [])

  // Save to localStorage
  const saveToStorage = useCallback((data: StoredCheckInData) => {
    localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(data))
    localStorage.setItem(COINS_STORAGE_KEY, data.totalCoins.toString())
  }, [])

  // Perform check-in
  const checkIn = useCallback(() => {
    if (!state.canCheckInToday) return null

    const today = getTodayDate()
    const newStreak = state.streak.current + 1
    const reward = getRewardForDay(newStreak)

    const newCheckInDay: CheckInDay = {
      date: today,
      checked: true,
      reward
    }

    const newState: CheckInState = {
      streak: {
        current: newStreak,
        longest: Math.max(state.streak.longest, newStreak),
        lastCheckIn: today
      },
      history: [newCheckInDay, ...state.history].slice(0, 365), // Keep 1 year of history
      totalCoins: state.totalCoins + reward.value,
      canCheckInToday: false
    }

    setState(newState)
    saveToStorage({
      streak: newState.streak,
      history: newState.history,
      totalCoins: newState.totalCoins
    })

    return reward
  }, [state, saveToStorage])

  // Get check-in status for a specific date
  const getCheckInStatus = useCallback(
    (date: string): CheckInDay | undefined => {
      return state.history.find((day) => day.date === date)
    },
    [state.history]
  )

  // Get calendar data for current month
  const getMonthCalendar = useCallback(
    (year: number, month: number): CheckInDay[] => {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const calendar: CheckInDay[] = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const existingDay = state.history.find((d) => d.date === date)
        calendar.push(existingDay || { date, checked: false })
      }

      return calendar
    },
    [state.history]
  )

  // Calculate next reward
  const nextReward = useMemo(() => {
    return getRewardForDay(state.streak.current + 1)
  }, [state.streak.current])

  // Get streak milestone progress
  const streakProgress = useMemo(() => {
    const milestones = Object.keys(DEFAULT_CHECKIN_CONFIG.streakBonuses).map(Number).sort((a, b) => a - b)
    const nextMilestone = milestones.find((m) => m > state.streak.current) || milestones[milestones.length - 1]
    const prevMilestone = milestones.filter((m) => m <= state.streak.current).pop() || 0

    return {
      current: state.streak.current,
      nextMilestone,
      prevMilestone,
      progress: ((state.streak.current - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    }
  }, [state.streak.current])

  return {
    ...state,
    checkIn,
    getCheckInStatus,
    getMonthCalendar,
    nextReward,
    streakProgress
  }
}

export default useDailyCheckIn

