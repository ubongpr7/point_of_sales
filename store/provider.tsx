"use client"

import type React from "react"
import { Provider } from "react-redux"
import { store } from "./store"
import { useRef } from "react"

interface Props {
  children: React.ReactNode
}

export default function StoreProvider({ children }: Props) {
  const storeRef = useRef(store)

  return <Provider store={storeRef.current}>{children}</Provider>
}
