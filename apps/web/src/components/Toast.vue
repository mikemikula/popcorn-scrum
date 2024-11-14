<template>
  <Transition name="toast">
    <div 
      v-if="show"
      class="toast-container"
      :class="type"
      role="alert"
    >
      <div class="toast-icon">
        {{ icon }}
      </div>
      <div class="toast-content">
        {{ message }}
      </div>
      <button 
        class="toast-close"
        @click="$emit('close')"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}>();

const icon = computed(() => ({
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️'
}[props.type]));

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--spacing-8);
  right: var(--spacing-8);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-6);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  box-shadow: var(--shadow-lg);
  z-index: 100;
}

.toast-icon {
  font-size: var(--font-size-xl);
}

.toast-content {
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-2);
  margin-left: var(--spacing-2);
  border-radius: var(--radius-full);
  transition: var(--transition-all);
}

.toast-close:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Toast Types */
.success {
  border-left: 4px solid var(--success);
}

.error {
  border-left: 4px solid var(--danger);
}

.warning {
  border-left: 4px solid var(--warning);
}

.info {
  border-left: 4px solid var(--accent-primary);
}

@media (max-width: 640px) {
  .toast-container {
    left: var(--spacing-4);
    right: var(--spacing-4);
    bottom: var(--spacing-4);
  }
}
</style> 