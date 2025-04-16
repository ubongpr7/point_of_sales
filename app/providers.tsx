"use client"

import type React from "react"
import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { PosProvider } from "@/context/pos-context"
import StoreProvider from "@/store/provider"
import { setupSyncListener } from "@/services/syncService"
import { useAppSelector } from "@/store/store"

// Separate component for theme to access Redux store
function ThemeProviderWithRedux({ children }: { children: React.ReactNode }) {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={isDarkMode ? "dark" : "light"}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setup sync listener when the app loads
    if (typeof window !== "undefined") {
      setupSyncListener()
    }
  }, [])

  return (
    <StoreProvider>
      <ThemeProviderWithRedux>
        <PosProvider>{children}</PosProvider>
      </ThemeProviderWithRedux>
    </StoreProvider>
  )
}

