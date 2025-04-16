import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import createWebStorage from "redux-persist/lib/storage/createWebStorage"
import authReducer from "./features/authSlice"
import { apiSlice } from "./services/apiSlice"
import globalReducer from "./state"
import posReducer from "./features/posSlice"
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null)
  },
  setItem(_key: string, value: any) {
    return Promise.resolve(value)
  },
  removeItem() {
    return Promise.resolve()
  },
})

const storage = typeof window === "undefined" ? createNoopStorage() : createWebStorage("local")

// Persist config for global slice
const globalPersistConfig = {
  key: "global",
  storage,
  whitelist: ["isDarkMode", "isSidebarCollapsed"],
}

// Persist config for POS slice
const posPersistConfig = {
  key: "pos",
  storage,
  whitelist: ["cart", "activeOrders", "isOfflineMode", "pendingSyncOperations"],
}

const rootReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  global: persistReducer(globalPersistConfig, globalReducer),
  pos: persistReducer(posPersistConfig, posReducer),
})

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(apiSlice.middleware),
  })
}

// Create store instance
const store = makeStore()
export const persistor = persistStore(store)

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export { store }
