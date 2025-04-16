"use client"

import type React from "react"
import { Provider } from "react-redux"
import { store } from "./store"
import { useRef, useEffect, useState } from "react"

interface Props {
  children: React.ReactNode
}

export default function StoreProvider({ children }: Props) {
  const [isReady, setIsReady] = useState(false)
  const storeRef = useRef<typeof store | null>(null)

  if (!storeRef.current) {
    storeRef.current = store
  }

  // Simple replacement for PersistGate - wait for rehydration
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      // Check if the store has been rehydrated by redux-persist
      if (state._persist?.rehydrated) {
        setIsReady(true)
        unsubscribe()
      }
    })

    // If for some reason rehydration doesn't happen, still show the app after a timeout
    const timeout = setTimeout(() => {
      setIsReady(true)
    }, 1000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  if (!isReady) {
    // You could return a loading indicator here if needed
    return null
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
