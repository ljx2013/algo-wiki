import { useState, useEffect } from 'react'

export function useSolutions() {
  const [solutions, setSolutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSolutions()
  }, [])

  async function fetchSolutions() {
    try {
      const response = await fetch('/data/solutions.json')
      if (!response.ok) throw new Error('Failed to fetch solutions')
      const data = await response.json()
      setSolutions(data.solutions || [])
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return { solutions, loading, error }
}

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}