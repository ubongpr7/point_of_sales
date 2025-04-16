import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "redux-persist/lib/storage"
import posReducer from "./posSlice"

// Add any other reducers you have here
// import otherReducer from './otherSlice';

const persistConfig = {
  key: "root",
  storage,
  // You can blacklist specific reducers if you don't want to persist them
  // blacklist: ['someReducer']
}

const rootReducer = combineReducers({
  pos: posReducer,
  // Add other reducers here
  // other: otherReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore["dispatch"]

// Create the store
const store = makeStore()
export const persistor = persistStore(store)

export default store
