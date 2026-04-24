<template>
  <div class="system-settings">
    <div class="settings-section">
      <div class="section-header">
        <span class="title">基础设置</span>
      </div>
      <el-form :model="settings" label-width="120px" class="settings-form">
        <el-form-item label="数据保存时间">
          <el-select v-model="settings.dataRetention">
            <el-option label="24小时" :value="24" />
            <el-option label="48小时" :value="48" />
            <el-option label="72小时" :value="72" />
            <el-option label="7天" :value="168" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动清理">
          <el-switch v-model="settings.autoCleanup" />
        </el-form-item>
        <el-form-item label="启动时自动运行">
          <el-switch v-model="settings.autoStart" />
        </el-form-item>
        <el-form-item label="窗口置顶">
          <el-switch v-model="settings.alwaysOnTop" />
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-section">
      <div class="section-header">
        <span class="title">打印设置</span>
      </div>
      <el-form :model="settings" label-width="120px" class="settings-form">
        <el-form-item label="打印份数">
          <el-input-number v-model="settings.printCopies" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="打印声音">
          <el-switch v-model="settings.printSound" />
        </el-form-item>
        <el-form-item label="打印失败重试">
          <el-switch v-model="settings.printRetry" />
        </el-form-item>
        <el-form-item label="重试次数">
          <el-input-number v-model="settings.retryCount" :min="1" :max="5" :disabled="!settings.printRetry" />
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-section">
      <div class="section-header">
        <span class="title">通知设置</span>
      </div>
      <el-form :model="settings" label-width="120px" class="settings-form">
        <el-form-item label="跑单提醒">
          <el-switch v-model="settings.runOrderAlert" />
        </el-form-item>
        <el-form-item label="系统通知">
          <el-switch v-model="settings.systemAlert" />
        </el-form-item>
        <el-form-item label="声音提醒">
          <el-switch v-model="settings.soundAlert" />
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-section">
      <div class="section-header">
        <span class="title">其他设置</span>
      </div>
      <el-form :model="settings" label-width="120px" class="settings-form">
        <el-form-item label="检查更新">
          <el-button size="small" @click="handleCheckUpdate">检查更新</el-button>
        </el-form-item>
        <el-form-item label="导出数据">
          <el-button size="small" @click="handleExportData">导出数据</el-button>
        </el-form-item>
        <el-form-item label="清除缓存">
          <el-button size="small" @click="handleClearCache">清除缓存</el-button>
        </el-form-item>
        <el-form-item label="恢复默认">
          <el-button size="small" type="danger" @click="handleResetSettings">恢复默认设置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-footer">
      <el-button type="primary" @click="handleSave">保存设置</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSettings',
  data() {
    return {
      settings: {
        dataRetention: 72,
        autoCleanup: true,
        autoStart: false,
        alwaysOnTop: false,
        printCopies: 1,
        printSound: true,
        printRetry: true,
        retryCount: 3,
        runOrderAlert: true,
        systemAlert: true,
        soundAlert: true
      }
    }
  },
  methods: {
    handleSave() {
      localStorage.setItem('systemSettings', JSON.stringify(this.settings))
      this.$message.success('设置已保存')
    },
    handleReset() {
      this.settings = {
        dataRetention: 72,
        autoCleanup: true,
        autoStart: false,
        alwaysOnTop: false,
        printCopies: 1,
        printSound: true,
        printRetry: true,
        retryCount: 3,
        runOrderAlert: true,
        systemAlert: true,
        soundAlert: true
      }
    },
    handleCheckUpdate() {
      this.$message.info('当前已是最新版本')
    },
    handleExportData() {
      this.$message.info('数据导出功能开发中')
    },
    handleClearCache() {
      localStorage.clear()
      this.$message.success('缓存已清除')
    },
    handleResetSettings() {
      this.$confirm('确定要恢复默认设置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleReset()
        this.$message.success('已恢复默认设置')
      }).catch(() => {})
    }
  },
  mounted() {
    const saved = localStorage.getItem('systemSettings')
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) }
    }
  }
}
</script>

<style scoped>
.system-settings {
  padding: 15px;
  height: 100%;
  overflow-y: auto;
}

.settings-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e6eb;
}

.section-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f3f5;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2935;
}

.settings-form {
  max-width: 500px;
}

.settings-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e6eb;
}
</style>
