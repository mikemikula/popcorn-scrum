import { ref } from 'vue'

interface ToastOptions {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export function useToast() {
  const show = ref(false)
  const message = ref('')
  const type = ref<'success' | 'error' | 'info' | 'warning'>('info')
  let timeout: NodeJS.Timeout | null = null

  const showToast = ({ message: msg, type: toastType, duration = 3000 }: ToastOptions) => {
    if (timeout) clearTimeout(timeout)
    
    message.value = msg
    type.value = toastType
    show.value = true

    timeout = setTimeout(() => {
      show.value = false
    }, duration)
  }

  const hideToast = () => {
    show.value = false
    if (timeout) clearTimeout(timeout)
  }

  return {
    show,
    message,
    type,
    showToast,
    hideToast
  }
} 