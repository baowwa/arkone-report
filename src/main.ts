import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import App from '@/App.vue'
import { router } from '@/router'
import { useAppStore } from '@/stores/app'
import '@/styles/main.scss'
import '@/styles/print.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

const store = useAppStore(pinia)
store.loadFromStorage()
store.$subscribe(() => {
  store.persistToStorage()
})

app.mount('#app')
