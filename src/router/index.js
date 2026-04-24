import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/setup',
    name: 'SystemSetup',
    component: () => import('../views/SystemSetup.vue'),
    meta: { title: '系统配置' }
  },
  {
    path: '/',
    component: () => import('../components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'DanmakuPrint',
        component: () => import('../views/DanmakuPrint.vue'),
        meta: { title: '扣打打印' }
      },
      {
        path: 'print-template',
        name: 'PrintTemplate',
        component: () => import('../views/PrintTemplate.vue'),
        meta: { title: '打印模板' }
      },
      {
        path: 'order-remark',
        name: 'OrderRemark',
        component: () => import('../views/OrderRemark.vue'),
        meta: { title: '订单备注' }
      },
      {
        path: 'buyer-manager',
        name: 'BuyerManager',
        component: () => import('../views/BuyerManager.vue'),
        meta: { title: '买家管理' }
      },
      {
        path: 'system-settings',
        name: 'SystemSettings',
        component: () => import('../views/SystemSettings.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('../views/Account.vue'),
        meta: { title: '我的账户' }
      },
      {
        path: 'douyin-config',
        name: 'DouyinConfig',
        component: () => import('../views/DouyinConfig.vue'),
        meta: { title: '抖音配置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
