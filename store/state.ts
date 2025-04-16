import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface GlobalState {
  isDarkMode: boolean
  isSidebarCollapsed: boolean
}

const initialState: GlobalState = {
  isDarkMode: false,
  isSidebarCollapsed: false,
}

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload
    },
  },
})

export const { toggleDarkMode, setDarkMode, toggleSidebar, setSidebarCollapsed } = globalSlice.actions
export default globalSlice.reducer
