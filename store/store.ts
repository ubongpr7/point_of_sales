import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "./storage"
import authReducer from "./features/authSlice"
import { apiSlice } from "./services/apiSlice"
import globalReducer from "./state"
import posReducer from "./features/posSlice"
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

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

// Add persist key to root reducer
const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
    blacklist: [apiSlice.reducerPath], // Don't persist API cache
  },
  rootReducer,
)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
})

// Initialize persistor
const persistor = persistStore(store)

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export { store, persistor }
