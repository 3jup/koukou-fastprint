import store from '../store'
import ruleService from './ruleService'
import printService from './printService'

let ws = null
let reconnectTimer = null
let currentShop = null
let demoInterval = null
let orderCount = 0
let connectionMode = 'demo'

const demoUsers = [
  { userId: 'demo1', nickname: '小明', hasFanBadge: true, contents: ['1', '2', '3', 'Y0815', 'M码', '已拍'] },
  { userId: 'demo2', nickname: '小红', hasFanBadge: true, contents: ['5', '8', 'XL', 'L码', 'Y0818'] },
  { userId: 'demo3', nickname: '张三', hasFanBadge: false, contents: ['10', '15', 'S码', '已拍'] },
  { userId: 'demo4', nickname: '李四', hasFanBadge: true, contents: ['7', '9', 'M码', '要'] },
  { userId: 'demo5', nickname: '王五', hasFanBadge: false, contents: ['ABC1', 'DEF2', 'Y0820', '123'] }
]

export default {
  async startListening(shop, mode = 'demo') {
    if (ws) {
      this.stopListening()
    }

    currentShop = shop
    connectionMode = mode

    console.log('📡 开始监听直播间:', shop?.name, '模式:', mode === 'real' ? '真实连接' : '演示模式')

    if (mode === 'real' && shop?.roomId) {
      await this.connectDouyinReal(shop)
    } else {
      this.startDemoMode()
    }
  },

  stopListening() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    if (demoInterval) {
      clearInterval(demoInterval)
      demoInterval = null
      console.log('⏹️ 停止演示模式')
    }

    if (ws) {
      try {
        ws.close()
      } catch (e) {
        console.error('关闭WebSocket失败:', e)
      }
      ws = null
    }

    store.commit('setIsRunning', false)
    currentShop = null
    console.log('⏹️ 停止监听')
  },

  async connectDouyinReal(shop) {
    try {
      console.log('📱 正在连接抖音直播间（真实模式）:', shop.roomId)

      const DouyinWebSocket = await import('./platform/douyin.js')

      ws = new DouyinWebSocket.DouyinWebSocket({
        roomId: shop.roomId,
        onMessage: (message) => {
          this.handleRealMessage(message)
        },
        onError: (error) => {
          console.error('❌ 抖音连接错误:', error)
          store.commit('setIsRunning', false)
        },
        onClose: () => {
          console.log('🔌 抖音连接已断开')
          store.commit('setIsRunning', false)
          this.scheduleReconnect(shop)
        },
        onOpen: () => {
          console.log('✅ 抖音直播间连接成功')
          store.commit('setIsRunning', true)
        }
      })

      await ws.connect(shop.roomId)
    } catch (error) {
      console.error('❌ 连接抖音失败:', error)
      console.log('📦 回退到演示模式')
      this.startDemoMode()
    }
  },

  handleRealMessage(message) {
    if (message.type === 'chat') {
      const danmaku = {
        userId: message.userId,
        nickname: message.nickname,
        content: message.content,
        userInfo: message.userInfo || {
          hasFanBadge: false,
          fansLevel: 0,
          isFollow: false
        }
      }

      console.log('💬 收到弹幕:', danmaku.nickname, ':', danmaku.content)
      this.processDanmaku(danmaku)
    } else if (message.type === 'member') {
      console.log('👤 用户进入:', message.nickname)
    } else if (message.type === 'heartbeat') {
      console.log('💓 心跳包')
    }
  },

  scheduleReconnect(shop) {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }

    console.log('🔄 10秒后尝试重新连接...')
    reconnectTimer = setTimeout(() => {
      if (currentShop && connectionMode === 'real') {
        this.connectDouyinReal(shop)
      }
    }, 10000)
  },

  async connectDouyin(shop) {
    try {
      console.log('🛒 正在连接淘宝直播间:', shop.roomId)
      store.commit('setIsRunning', false)
      this.$message.info('淘宝直播连接功能开发中')
    } catch (error) {
      console.error('❌ 连接淘宝失败:', error)
    }
  },

  processDanmaku(danmaku) {
    const state = store.state
    const settings = state.advancedSettings
    const rules = state.rules

    if (ruleService.checkBlacklist(danmaku.userId, [])) {
      console.log('🚫 黑名单用户，跳过:', danmaku.nickname)
      return
    }

    const antiSpamTime = (settings.antiSpamTime || 5) * 1000
    if (settings.antiSpam && ruleService.checkAntiSpam(danmaku.userId, danmaku.content, antiSpamTime)) {
      console.log('🛡️ 防刷屏拦截:', danmaku.content)
      return
    }

    if (!ruleService.checkFanPriority(danmaku.userInfo, settings)) {
      console.log('⭐ 灯牌用户优先:', danmaku.nickname)
      return
    }

    const matched = ruleService.matchRule(
      danmaku.content,
      rules.selectedRule,
      {
        keywords: rules.keywordSettings?.keywords || []
      }
    )

    if (!matched) {
      return
    }

    this.createOrder(danmaku)
  },

  createOrder(danmaku) {
    const state = store.state
    const settings = state.advancedSettings

    if (settings.limitedRush) {
      const currentCount = store.getters.currentRoundOrderCount
      if (currentCount >= settings.limitCount) {
        console.log('🏆 已达限量上限')
        return
      }
    }

    const order = {
      shopId: state.currentShop?.id,
      shopName: state.currentShop?.name || '未知店铺',
      userId: danmaku.userId,
      nickname: danmaku.nickname,
      content: danmaku.content,
      itemId: ruleService.extractItemId(danmaku.content),
      matchedContent: danmaku.content,
      status: '已扣中'
    }

    store.commit('addOrder', order)
    orderCount++

    console.log(`✅ 新订单 #${orderCount}:`, order.nickname, order.content)

    this.autoPrint(order)
  },

  async autoPrint(order) {
    const state = store.state

    if (!state.autoPrint || !state.currentPrinter) {
      return
    }

    try {
      const template = state.currentTemplate || {
        width: 50,
        height: 30,
        fields: ['itemId', 'nickname', 'content', 'time', 'serial', 'round'],
        align: 'left'
      }

      await printService.printLabel(order, template, {
        mirror: state.advancedSettings.mirrorPrint
      })
      console.log('🖨️ 打印成功')
    } catch (error) {
      console.error('❌ 打印失败:', error)
    }
  },

  startDemoMode() {
    console.log('🎬 演示模式已启动')

    store.commit('setIsRunning', true)

    if (demoInterval) {
      clearInterval(demoInterval)
    }

    demoInterval = setInterval(() => {
      if (!store.state.isRunning) {
        clearInterval(demoInterval)
        demoInterval = null
        console.log('⏹️ 停止演示模式')
        return
      }

      const user = demoUsers[Math.floor(Math.random() * demoUsers.length)]
      const content = user.contents[Math.floor(Math.random() * user.contents.length)]

      const danmaku = {
        userId: user.userId,
        nickname: user.nickname,
        content: content,
        userInfo: {
          hasFanBadge: user.hasFanBadge
        }
      }

      console.log('💬 演示弹幕:', danmaku.nickname, ':', danmaku.content)
      this.processDanmaku(danmaku)
    }, 1500)
  },

  getConnectionStatus() {
    return {
      mode: connectionMode,
      isRunning: store.state.isRunning,
      currentShop: currentShop?.name || null,
      orderCount: orderCount,
      wsStatus: ws?.readyState || null
    }
  }
}
