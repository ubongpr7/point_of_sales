// Simple storage implementation that works in both browser and server environments
const createStorage = () => {
  if (typeof window === "undefined") {
    // Return a no-op storage for server-side
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    }
  }

  // Use localStorage in the browser
  return {
    getItem: (key: string) => {
      try {
        const item = window.localStorage.getItem(key)
        return Promise.resolve(item)
      } catch (error) {
        return Promise.resolve(null)
      }
    },
    setItem: (key: string, value: string) => {
      try {
        window.localStorage.setItem(key, value)
        return Promise.resolve()
      } catch (error) {
        return Promise.resolve()
      }
    },
    removeItem: (key: string) => {
      try {
        window.localStorage.removeItem(key)
        return Promise.resolve()
      } catch (error) {
        return Promise.resolve()
      }
    },
  }
}

const storage = createStorage()

export default storage
