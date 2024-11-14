import { ref } from 'vue'

export function useLoading() {
  const isLoading = ref(false)
  const loadingText = ref('')

  const startLoading = (text = 'Loading...') => {
    loadingText.value = text
    isLoading.value = true
  }

  const stopLoading = () => {
    isLoading.value = false
    loadingText.value = ''
  }

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading
  }
} 