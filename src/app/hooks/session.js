'use client'
import { useState, useEffect } from 'react'

export function useSessionStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    try {
      const item = sessionStorage.getItem(key)
      if (item !== null) {
        setValue(item)
      }
    } catch (error) {
      console.error('Error reading sessionStorage:', error)
    }
  }, [key])

  const setStoredValue = val => {
    try {
      const valueToStore = val instanceof Function ? val(value) : val
      setValue(valueToStore)

      sessionStorage.setItem(key, valueToStore)
    } catch (error) {
      console.error('Error setting sessionStorage:', error)
    }
  }

  return [value, setStoredValue]
}
