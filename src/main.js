import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/bytedance.css'

console.log('🚀 Vue 应用开始初始化...')
console.log('📍 当前路径:', window.location.href)

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)

app.mount('#app')

console.log('✅ Vue 应用已挂载到 #app')
