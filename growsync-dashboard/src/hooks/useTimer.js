import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1)
      }, 1000)
    }
  }, [isRunning])

  const pause = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    pause()
    setTime(0)
  }, [pause])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return { time, isRunning, start, pause, reset, formattedTime: formatTime(time) }
}
