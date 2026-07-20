import { useEffect, useCallback } from 'react'

function useInfiniteScroll(callback, hasMore, isLoading) {
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight
    
    // Trigger when user is within 300px of bottom
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      callback()
    }
  }, [callback, hasMore, isLoading])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])
}

export default useInfiniteScroll