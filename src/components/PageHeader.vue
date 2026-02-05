<template>
  <div class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header__actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  font-family: 'Source Serif 4', 'IBM Plex Sans', serif;
  color: #1f2a2e;
}

.page-header p {
  margin: 6px 0 0;
  color: #5b6b72;
}

.page-header__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
