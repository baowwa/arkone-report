import { createRouter, createWebHistory } from 'vue-router'
import ReportsList from '@/pages/ReportsList.vue'
import ReportDetail from '@/pages/ReportDetail.vue'
import TemplatesList from '@/pages/TemplatesList.vue'
import TemplateEditor from '@/pages/TemplateEditor.vue'
import Ingest from '@/pages/Ingest.vue'
import Dictionary from '@/pages/Dictionary.vue'
import Settings from '@/pages/Settings.vue'
import Help from '@/pages/Help.vue'

const routes = [
  { path: '/', redirect: '/reports' },
  { path: '/reports', component: ReportsList },
  { path: '/reports/:id', component: ReportDetail },
  { path: '/templates', component: TemplatesList },
  { path: '/templates/:id', component: TemplateEditor },
  { path: '/ingest', component: Ingest },
  { path: '/dictionary', component: Dictionary },
  { path: '/settings', component: Settings },
  { path: '/help', component: Help }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
