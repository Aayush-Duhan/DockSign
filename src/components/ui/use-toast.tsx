import { useEffect, useState } from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastState: { toasts: ToasterToast[] } = {
  toasts: [],
}

export const toastActions = {
  add: (toast: Omit<ToasterToast, "id">) => {
    const id = genId()
    
    const toasts = [
      { id, ...toast },
      ...toastState.toasts,
    ].slice(0, TOAST_LIMIT)
    
    toastState.toasts = toasts
    
    return id
  },
  remove: (id: string) => {
    toastState.toasts = toastState.toasts.filter(
      (toast) => toast.id !== id
    )
  },
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  useEffect(() => {
    // Create a mutation observer to watch for changes in the toast state
    const intervalId = setInterval(() => {
      setToasts([...toastState.toasts])
    }, 100)

    return () => clearInterval(intervalId)
  }, [])

  return {
    toasts,
    toast: (props: Omit<ToasterToast, "id">) => {
      const id = toastActions.add(props)
      
      setTimeout(() => {
        toastActions.remove(id)
      }, TOAST_REMOVE_DELAY)
      
      return id
    },
    dismiss: (id: string) => {
      toastActions.remove(id)
    },
  }
} 