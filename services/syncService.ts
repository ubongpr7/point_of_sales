import { store } from "@/store/store"
import { clearPendingSyncOperations, removePendingSyncOperation } from "@/store/features/posSlice"
import { posApiSlice } from "@/store/services/posApiSlice"

export async function syncPendingOperations() {
  const state = store.getState()
  const pendingOperations = state.pos.pendingSyncOperations

  if (pendingOperations.length === 0) {
    return { success: true, message: "No pending operations to sync" }
  }

  let successCount = 0
  let failureCount = 0

  // Sort operations by timestamp to ensure they're processed in order
  const sortedOperations = [...pendingOperations].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  for (let i = 0; i < sortedOperations.length; i++) {
    const operation = sortedOperations[i]

    try {
      switch (operation.type) {
        case "createOrder":
          await store.dispatch(
            posApiSlice.endpoints.createOrder.initiate({
              session: state.pos.currentSession?.sync_identifier,
              items: operation.data.items,
              customer_id: operation.data.customer_id,
              table_id: operation.data.table_id,
            }),
          )
          break

        case "updateOrderStatus":
          await store.dispatch(
            posApiSlice.endpoints.updateOrderStatus.initiate({
              id: operation.data.orderId,
              status: operation.data.status,
            }),
          )
          break

        case "updateTableStatus":
          await store.dispatch(
            posApiSlice.endpoints.updateTableStatus.initiate({
              id: operation.data.tableId,
              status: operation.data.status,
            }),
          )
          break

        case "processPayment":
          await store.dispatch(
            posApiSlice.endpoints.processPayment.initiate({
              order: operation.data.order,
              payment_method: operation.data.payment_method,
              amount: operation.data.amount,
              transaction_ref: operation.data.transaction_ref,
              tip_amount: operation.data.tip_amount,
            }),
          )
          break

        case "startSession":
          await store.dispatch(
            posApiSlice.endpoints.startSession.initiate({
              opening_balance: operation.data.opening_balance,
              terminal: operation.data.terminal,
            }),
          )
          break

        default:
          console.warn(`Unknown operation type: ${operation.type}`)
          break
      }

      // Remove the operation from the pending list
      store.dispatch(removePendingSyncOperation(i - successCount))
      successCount++
    } catch (error) {
      console.error(`Failed to sync operation: ${operation.type}`, error)
      failureCount++

      // If this is a critical operation that subsequent operations depend on,
      // we might want to stop processing and retry later
      if (operation.type === "startSession" || operation.type === "createOrder") {
        break
      }
    }
  }

  if (failureCount === 0) {
    // All operations synced successfully
    store.dispatch(clearPendingSyncOperations())
    return { success: true, message: `Successfully synced ${successCount} operations` }
  }

  return {
    success: false,
    message: `Synced ${successCount} operations, failed to sync ${failureCount} operations`,
  }
}

// Function to check network status and trigger sync when back online
export function setupSyncListener() {
  let isOnline = navigator.onLine

  window.addEventListener("online", async () => {
    if (!isOnline) {
      isOnline = true
      console.log("Back online, syncing pending operations...")
      await syncPendingOperations()
    }
  })

  window.addEventListener("offline", () => {
    isOnline = false
    console.log("Offline mode activated")
  })

  // Initial sync if online
  if (isOnline) {
    syncPendingOperations()
  }
}
