<template>
  <div class="loading-container" :class="{ 'is-overlay': overlay }">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <div class="loading-text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
  overlay?: boolean;
}>();
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-8);
}

.loading-container.is-overlay {
  position: fixed;
  inset: 0;
  background: rgba(var(--bg-primary-rgb), 0.8);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid var(--accent-primary);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: var(--spacing-4);
  color: var(--text-secondary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 