<template>
  <div class="system-setup">
    <div class="setup-container">
      <div class="setup-header">
        <div class="logo-section">
          <div class="app-icon">🚀</div>
          <h1 class="app-title">扣扣快打</h1>
        </div>
        <p class="setup-subtitle">智能配置向导</p>
      </div>

      <div class="setup-content">
        <div class="progress-section" v-if="isChecking || isInstalling">
          <div class="progress-icon">
            <div v-if="isChecking" class="checking-animation">🔍</div>
            <div v-else class="installing-animation">⚙️</div>
          </div>
          <div class="progress-text">{{ progressMessage }}</div>
          <el-progress
            :percentage="progressPercent"
            :status="progressStatus"
            :show-text="true"
          />
        </div>

        <div class="check-results" v-else>
          <div class="result-item" v-for="item in checkResults" :key="item.key">
            <div class="result-icon" :class="item.status">
              <span v-if="item.status === 'ok'">✅</span>
              <span v-else-if="item.status === 'missing'">❌</span>
              <span v-else-if="item.status === 'error'">⚠️</span>
              <span v-else>⏳</span>
            </div>
            <div class="result-info">
              <div class="result-title">{{ item.title }}</div>
              <div class="result-message">{{ item.message }}</div>
              <div class="result-version" v-if="item.version">{{ item.version }}</div>
            </div>
            <div class="result-action">
              <el-button
                v-if="item.status === 'missing' && item.action"
                type="primary"
                size="small"
                :loading="installingAction === item.action"
                @click="handleInstall(item.action)"
              >
                {{ item.autoInstallable ? '自动安装' : '手动安装' }}
              </el-button>
              <el-tag v-else-if="item.status === 'ok'" type="success" size="small">已就绪</el-tag>
            </div>
          </div>
        </div>

        <div class="setup-actions">
          <el-button
            v-if="!isChecking && !isInstalling"
            type="primary"
            size="large"
            :disabled="!canProceed"
            @click="handleProceed"
          >
            {{ canProceed ? '开始使用' : '请先完成配置' }}
          </el-button>
          <el-button
            v-if="!isChecking && !isInstalling"
            size="large"
            @click="handleRecheck"
          >
            重新检测
          </el-button>
        </div>

        <div class="help-section">
          <el-collapse>
            <el-collapse-item title="遇到问题？" name="help">
              <div class="help-content">
                <div class="help-item">
                  <h4>Node.js 安装失败</h4>
                  <p>请访问 <el-link type="primary" @click="openUrl('https://nodejs.org/')">nodejs.org</el-link> 下载安装包手动安装</p>
                </div>
                <div class="help-item">
                  <h4>打印机驱动问题</h4>
                  <p>请访问 <el-link type="primary" @click="openUrl('https://cn.hprt.com/XiaZai.html')">汉印官网</el-link> 下载Mac版驱动</p>
                </div>
                <div class="help-item">
                  <h4>需要帮助？</h4>
                  <p>联系客服获取帮助</p>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <div class="setup-footer">
        <p class="copyright">扣扣快打 v1.0.0 - 让直播打单更简单</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSetup',
  data() {
    return {
      isChecking: true,
      isInstalling: false,
      installingAction: null,
      progressMessage: '正在检测系统环境...',
      progressPercent: 0,
      progressStatus: '',
      checkResults: [],
      recommendations: []
    }
  },
  computed: {
    canProceed() {
      return this.checkResults.every(item =>
        item.status === 'ok' || item.status === 'manual'
      )
    }
  },
  mounted() {
    this.initSystemCheck()
    this.setupEventListeners()
  },
  beforeUnmount() {
    if (window.electronAPI) {
      window.electronAPI.removeAllListeners('install-progress')
      window.electronAPI.removeAllListeners('install-error')
      window.electronAPI.removeAllListeners('install-completed')
    }
  },
  methods: {
    setupEventListeners() {
      if (!window.electronAPI) {
        this.isChecking = false
        this.checkResults = [
          {
            key: 'nodejs',
            title: 'Node.js',
            status: 'ok',
            message: '开发模式运行中',
            version: 'v18.x'
          },
          {
            key: 'printer',
            title: '汉印打印机',
            status: 'ok',
            message: '请在真实环境中测试'
          }
        ]
        return
      }

      window.electronAPI.onInstallProgress((progress) => {
        this.progressMessage = progress.message
        this.isInstalling = true

        if (progress.status === 'installing') {
          this.progressPercent = 50
          this.installingAction = progress.step
        } else if (progress.status === 'completed') {
          this.progressPercent = 100
          this.progressStatus = 'success'
        }
      })

      window.electronAPI.onInstallError((error) => {
        this.$message.error(`${error.step} 安装失败: ${error.error}`)
        this.isInstalling = false
        this.progressStatus = 'exception'
      })

      window.electronAPI.onInstallCompleted((results) => {
        this.isInstalling = false
        this.progressStatus = 'success'
        this.$message.success('安装完成！正在重新检测...')
        setTimeout(() => this.performSystemCheck(), 1000)
      })
    },
    async initSystemCheck() {
      this.isChecking = true
      this.progressMessage = '正在检测系统环境...'

      await this.performSystemCheck()
    },
    async performSystemCheck() {
      try {
        this.isChecking = true
        this.progressMessage = '正在检测系统环境...'

        let result
        if (window.electronAPI) {
          result = await window.electronAPI.systemCheck()
        } else {
          result = this.getMockCheckResult()
        }

        this.checkResults = this.formatCheckResults(result.results)
        this.recommendations = result.recommendations || []

        if (this.canProceed) {
          this.progressMessage = '系统环境检测通过！'
          this.progressPercent = 100
          this.progressStatus = 'success'
        } else {
          this.progressMessage = '检测到环境问题，请按提示完成配置'
          this.progressPercent = 33
          this.progressStatus = 'warning'
        }
      } catch (error) {
        console.error('系统检测失败:', error)
        this.progressMessage = '系统检测失败'
        this.progressStatus = 'exception'
        this.$message.error('系统检测失败: ' + error.message)
      } finally {
        this.isChecking = false
      }
    },
    formatCheckResults(results) {
      if (!results) {
        return []
      }

      const items = []

      items.push({
        key: 'nodejs',
        title: 'Node.js',
        status: results.nodejs?.installed ? 'ok' : 'missing',
        message: results.nodejs?.message || '未安装',
        version: results.nodejs?.version,
        action: results.nodejs?.installed ? null : 'install_nodejs',
        autoInstallable: true
      })

      items.push({
        key: 'homebrew',
        title: 'Homebrew',
        status: results.homebrew?.installed ? 'ok' : 'missing',
        message: results.homebrew?.message || '未安装',
        version: results.homebrew?.version,
        action: results.homebrew?.installed ? null : 'install_homebrew',
        autoInstallable: true
      })

      items.push({
        key: 'printer',
        title: '汉印打印机',
        status: results.printer?.hasHPRTPrinter ? 'ok' : 'missing',
        message: results.printer?.message || '未检测到汉印打印机',
        action: results.printer?.hasHPRTPrinter ? null : 'install_printer',
        autoInstallable: false
      })

      items.push({
        key: 'webbluetooth',
        title: 'Web Bluetooth',
        status: results.webBluetooth?.supported ? 'ok' : 'error',
        message: results.webBluetooth?.message || '不支持',
        action: null,
        autoInstallable: false
      })

      return items
    },
    async handleInstall(action) {
      if (!window.electronAPI) {
        this.$message.warning('仅在桌面应用中可用')
        return
      }

      try {
        if (action === 'install_printer') {
          await window.electronAPI.openExternal('https://cn.hprt.com/XiaZai.html')
          this.$message.info('请在打开的页面中下载并安装驱动，安装完成后点击"重新检测"')
        } else {
          this.isInstalling = true
          this.installingAction = action
          this.progressMessage = '正在安装...'
          this.progressPercent = 30

          const result = await window.electronAPI.autoInstall(action)

          if (result.success) {
            this.$message.success('安装成功！')
          } else {
            this.$message.error('安装失败: ' + result.error)
          }
        }
      } catch (error) {
        this.$message.error('安装失败: ' + error.message)
        this.isInstalling = false
      }
    },
    async handleRecheck() {
      await this.performSystemCheck()
    },
    handleProceed() {
      this.$emit('setup-complete')
    },
    openUrl(url) {
      if (window.electronAPI) {
        window.electronAPI.openExternal(url)
      } else {
        window.open(url, '_blank')
      }
    },
    getMockCheckResult() {
      return {
        results: {
          nodejs: { installed: true, version: 'v18.17.0', status: 'ok', message: 'Node.js v18.17.0 已安装' },
          homebrew: { installed: true, version: 'Homebrew 4.1.0', status: 'ok', message: 'Homebrew 已安装' },
          printer: { installed: false, hasHPRTPrinter: false, status: 'missing', message: '未检测到汉印打印机' },
          webBluetooth: { supported: true, status: 'ok', message: 'Web Bluetooth API 可用' },
          webUSB: { supported: true, status: 'ok', message: 'Web USB API 可用' }
        },
        recommendations: [
          { type: 'warning', title: '安装打印机驱动', action: 'install_printer', autoInstallable: false }
        ],
        status: { ready: false }
      }
    }
  }
}
</script>

<style scoped>
.system-setup {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.setup-container {
  width: 100%;
  max-width: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.setup-header {
  background: linear-gradient(135deg, #1d2935 0%, #0f161e 100%);
  color: #fff;
  padding: 40px;
  text-align: center;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.app-icon {
  font-size: 48px;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 2px;
}

.setup-subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
}

.setup-content {
  padding: 40px;
}

.progress-section {
  text-align: center;
  padding: 40px 0;
}

.progress-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.checking-animation,
.installing-animation {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.progress-text {
  font-size: 18px;
  color: #1d2129;
  margin-bottom: 20px;
}

.check-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 12px;
  gap: 16px;
}

.result-icon {
  font-size: 32px;
  width: 48px;
  text-align: center;
}

.result-info {
  flex: 1;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.result-message {
  font-size: 13px;
  color: #86909c;
}

.result-version {
  font-size: 12px;
  color: #1677ff;
  margin-top: 4px;
}

.result-action {
  min-width: 100px;
  text-align: right;
}

.setup-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 30px;
}

.setup-actions .el-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.help-section {
  margin-top: 30px;
}

.help-content {
  padding: 0 10px;
}

.help-item {
  margin-bottom: 20px;
}

.help-item h4 {
  font-size: 14px;
  color: #1d2129;
  margin-bottom: 8px;
}

.help-item p {
  font-size: 13px;
  color: #86909c;
  line-height: 1.6;
}

.setup-footer {
  background: #f7f8fa;
  padding: 20px;
  text-align: center;
}

.copyright {
  font-size: 12px;
  color: #86909c;
  margin: 0;
}
</style>
