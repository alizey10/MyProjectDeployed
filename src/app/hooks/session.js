'use client'
import { useState } from "react"

export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== "undefined" ? sessionStorage.getItem(key) : null
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error("Error reading sessionStorage:", error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error("Error setting sessionStorage:", error)
    }
  }

  return [storedValue, setValue]
}
