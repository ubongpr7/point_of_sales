import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Helper function to safely get system theme
const getSystemTheme = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

// Default initial state for SSR
const defaultState = {
  isDarkMode: false,
  isSidebarCollapsed: false,
  isSystemTheme: true,
}

// Create the slice with SSR-safe initial state
const globalSlice = createSlice({
  name: "global",
  initialState: defaultState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
      state.isSystemTheme = false
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload
      state.isSystemTheme = false
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload
    },
    resetToSystemTheme: (state) => {
      state.isDarkMode = getSystemTheme()
      state.isSystemTheme = true
    },
  },
})

export const { toggleDarkMode, setDarkMode, toggleSidebar, setSidebarCollapsed, resetToSystemTheme } =
  globalSlice.actions

export default globalSlice.reducer
