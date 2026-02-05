import { createRouter, createWebHistory } from 'vue-router'
import Reports from '@/pages/Reports.vue'
import Templates from '@/pages/Templates.vue'
import Ingest from '@/pages/Ingest.vue'
import Dictionary from '@/pages/Dictionary.vue'
import Settings from '@/pages/Settings.vue'
import Help from '@/pages/Help.vue'

const routes = [
  { path: '/', redirect: '/reports' },
  { path: '/reports', component: Reports },
  { path: '/templates', component: Templates },
  { path: '/ingest', component: Ingest },
  { path: '/dictionary', component: Dictionary },
  { path: '/settings', component: Settings },
  { path: '/help', component: Help }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
