"use client"

import type React from "react"
import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { PosProvider } from "@/context/pos-context"
import StoreProvider from "@/store/provider"
import { setupSyncListener } from "@/services/syncService"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setup sync listener when the app loads
    if (typeof window !== "undefined") {
      setupSyncListener()
    }
  }, [])

  return (
    <StoreProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <PosProvider>{children}</PosProvider>
      </ThemeProvider>
    </StoreProvider>
  )
}
