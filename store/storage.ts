// Storage implementation that's safe for SSR
const createStorage = () => {
  // Always return a consistent API shape
  if (typeof window === "undefined") {
    // Server-side - return no-op storage
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    }
  }

  // Client-side - use localStorage
  return {
    getItem: (key: string) => {
      try {
        const item = window.localStorage.getItem(key)
        return Promise.resolve(item)
      } catch (error) {
        console.error("Error accessing localStorage:", error)
        return Promise.resolve(null)
      }
    },
    setItem: (key: string, value: string) => {
      try {
        window.localStorage.setItem(key, value)
        return Promise.resolve()
      } catch (error) {
        console.error("Error writing to localStorage:", error)
        return Promise.resolve()
      }
    },
    removeItem: (key: string) => {
      try {
        window.localStorage.removeItem(key)
        return Promise.resolve()
      } catch (error) {
        console.error("Error removing from localStorage:", error)
        return Promise.resolve()
      }
    },
  }
}

const storage = createStorage()

export default storage
