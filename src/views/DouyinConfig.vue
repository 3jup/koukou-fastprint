<template>
  <div class="douyin-config">
    <div class="page-header">
      <div class="header-left">
        <div class="page-icon">📱</div>
        <h2 class="page-title">抖音直播配置</h2>
      </div>
    </div>

    <div class="config-content">
      <!-- Cookie配置 -->
      <div class="config-section">
        <div class="section-header">
          <div class="section-icon">🍪</div>
          <h3 class="section-title">Cookie配置</h3>
        </div>
        <div class="section-content">
          <el-form label-position="top">
            <el-form-item label="Cookie">
              <el-input
                v-model="cookie"
                type="textarea"
                :rows="6"
                placeholder="请在此处粘贴从抖音网页获取的Cookie"
              />
            </el-form-item>
            <div class="cookie-actions">
              <el-button type="primary" @click="saveCookie">保存Cookie</el-button>
              <el-button @click="clearCookie">清除</el-button>
              <el-button @click="testCookie">测试Cookie</el-button>
            </div>
            <div class="cookie-help">
              <h4>📖 如何获取Cookie？</h4>
              <ol>
                <li>打开浏览器，访问 <a href="https://live.douyin.com" target="_blank">https://live.douyin.com</a></li>
                <li>登录您的抖音账号</li>
                <li>按 F12 打开开发者工具</li>
                <li>切换到 Network 标签，刷新页面</li>
                <li>找到任意请求，复制 Request Headers 中的 Cookie</li>
                <li>将Cookie粘贴到上面的输入框中</li>
              </ol>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 房间ID配置 -->
      <div class="config-section">
        <div class="section-header">
          <div class="section-icon">🏠</div>
          <h3 class="section-title">房间ID配置</h3>
        </div>
        <div class="section-content">
          <el-form label-position="top">
            <el-form-item label="房间ID">
              <el-input
                v-model="roomId"
                placeholder="请输入直播间ID"
              />
            </el-form-item>
            <div class="room-id-help">
              <h4>📖 如何获取直播间ID？</h4>
              <ol>
                <li>打开抖音网页版直播间</li>
                <li>查看URL地址，例如：https://live.douyin.com/123456789</li>
                <li>URL中最后的数字就是房间ID：123456789</li>
                <li>或者通过直播间分享链接获取</li>
              </ol>
            </div>
            <div class="room-id-actions">
              <el-button type="primary" @click="saveRoomIdDirectly">保存房间ID</el-button>
              <el-button @click="testRoom">测试连接</el-button>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 连接状态 -->
      <div class="config-section">
        <div class="section-header">
          <div class="section-icon">🔌</div>
          <h3 class="section-title">连接状态</h3>
        </div>
        <div class="section-content">
          <div class="status-card" :class="{ active: isConnected }">
            <div class="status-icon">{{ isConnected ? '✅' : '❌' }}</div>
            <div class="status-info">
              <div class="status-text">{{ isConnected ? '已连接' : '未连接' }}</div>
              <div class="status-detail">{{ connectionDetail }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试弹幕 -->
      <div class="config-section">
        <div class="section-header">
          <div class="section-icon">💬</div>
          <h3 class="section-title">测试弹幕</h3>
        </div>
        <div class="section-content">
          <div class="test-danmaku-list">
            <div v-for="(msg, index) in testMessages" :key="index" class="test-message">
              <span class="msg-user">{{ msg.nickname }}:</span>
              <span class="msg-content">{{ msg.content }}</span>
            </div>
            <div v-if="testMessages.length === 0" class="empty-messages">
              暂无测试消息
            </div>
          </div>
          <el-button @click="simulateMessage">模拟弹幕</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DouyinCookieManager } from '../services/platform/douyin-cookie-manager'

export default {
  name: 'DouyinConfig',
  data() {
    return {
      cookie: '',
      roomId: '',
      isConnected: false,
      connectionDetail: '',
      testMessages: [],
      cookieManager: null
    }
  },
  mounted() {
    this.cookieManager = new DouyinCookieManager()
    this.cookie = this.cookieManager.getCookie()
    this.loadSavedRoomId()
  },
  methods: {
    saveCookie() {
      const validation = this.cookieManager.validateCookie(this.cookie)
      if (!validation.valid) {
        this.$message.warning(validation.reason)
        return
      }

      this.cookieManager.saveCookie(this.cookie)
      this.$message.success('Cookie已保存')
    },

    clearCookie() {
      this.cookie = ''
      this.cookieManager.clearCookie()
      this.$message.success('Cookie已清除')
    },

    testCookie() {
      const validation = this.cookieManager.validateCookie(this.cookie)
      if (validation.valid) {
        this.$message.success('Cookie格式验证通过')
      } else {
        this.$message.warning(validation.reason)
      }
    },

    testRoom() {
      if (!this.roomId) {
        this.$message.warning('请输入房间ID')
        return
      }

      this.isConnected = true
      this.connectionDetail = `房间ID: ${this.roomId}`
      this.saveRoomId()
      this.$message.success('连接测试成功（模拟）')

      this.simulateMessage()
    },

    saveRoomIdDirectly() {
      if (!this.roomId) {
        this.$message.warning('请输入房间ID')
        return
      }

      this.saveRoomId()
      this.$message.success('房间ID已保存')
    },

    simulateMessage() {
      const users = ['小明', '小红', '张三', '李四', '王五']
      const contents = ['1', '2', '3', '要了', '已拍', 'M码', 'L码']

      const msg = {
        userId: Date.now(),
        nickname: users[Math.floor(Math.random() * users.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        timestamp: Date.now()
      }

      this.testMessages.unshift(msg)
      if (this.testMessages.length > 10) {
        this.testMessages.pop()
      }
    },

    saveRoomId() {
      try {
        localStorage.setItem('douyin-room-id', this.roomId)
      } catch (e) {
        console.error('保存房间ID失败:', e)
      }
    },

    loadSavedRoomId() {
      try {
        const saved = localStorage.getItem('douyin-room-id')
        if (saved) {
          this.roomId = saved
        }
      } catch (e) {
        console.error('加载房间ID失败:', e)
      }
    }
  }
}
</script>

<style scoped>
.douyin-config {
  height: 100%;
  background: #f5f7fa;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon {
  font-size: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2935;
  margin: 0;
}

.config-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
  overflow-y: auto;
  padding-right: 8px;
  min-height: 0;
}

.config-content::-webkit-scrollbar {
  width: 6px;
}

.config-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.config-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.config-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.config-section {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
  border-bottom: 1px solid #e2e8f0;
}

.section-icon {
  font-size: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2935;
  margin: 0;
}

.section-content {
  padding: 24px;
}

.cookie-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.cookie-help {
  margin-top: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #1677ff;
}

.cookie-help h4 {
  margin: 0 0 12px 0;
  color: #1d2935;
}

.cookie-help ol {
  margin: 0;
  padding-left: 20px;
  color: #4e5969;
  line-height: 2;
}

.cookie-help a {
  color: #1677ff;
  text-decoration: none;
}

.cookie-help a:hover {
  text-decoration: underline;
}

.room-id-help {
  margin-top: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #52c41a;
}

.room-id-help h4 {
  margin: 0 0 12px 0;
  color: #1d2935;
}

.room-id-help ol {
  margin: 0;
  padding-left: 20px;
  color: #4e5969;
  line-height: 2;
}

.room-id-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.status-card.active {
  background: #f0fff7;
  border-color: #52c41a;
}

.status-icon {
  font-size: 48px;
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 20px;
  font-weight: 600;
  color: #1d2935;
  margin-bottom: 4px;
}

.status-detail {
  font-size: 14px;
  color: #86909c;
}

.test-danmaku-list {
  max-height: 300px;
  overflow-y: auto;
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.test-message {
  padding: 10px 14px;
  margin-bottom: 8px;
  background: #ffffff;
  border-radius: 8px;
  border-left: 3px solid #1677ff;
}

.msg-user {
  font-weight: 600;
  color: #1d2935;
  margin-right: 8px;
}

.msg-content {
  color: #4e5969;
}

.empty-messages {
  padding: 40px;
  text-align: center;
  color: #86909c;
}
</style>
