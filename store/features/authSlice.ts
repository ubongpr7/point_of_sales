import { createSlice } from "@reduxjs/toolkit"

interface AuthState {
  isAuthenticated: boolean
  user: any | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state) => {
      state.isAuthenticated = true
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
    },
  },
})

export const { setAuth, setUser, logout } = authSlice.actions
export default authSlice.reducer
