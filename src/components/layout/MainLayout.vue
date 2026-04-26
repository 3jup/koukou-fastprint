<template>
  <div class="main-layout">
    <!-- 自定义标题栏 -->
    <div class="custom-titlebar" @mousedown="startDrag">
      <div class="titlebar-left">
        <span class="app-title">扣扣快打</span>
      </div>
      <div class="titlebar-right">
        <button class="window-btn" @click="minimizeWindow">
          <span class="btn-icon">—</span>
        </button>
        <button class="window-btn" @click="maximizeWindow">
          <span class="btn-icon">{{ isMaximized ? '⬜' : '□' }}</span>
        </button>
        <button class="window-btn close-btn" @click="closeWindow">
          <span class="btn-icon">✕</span>
        </button>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <Sidebar />
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue'

export default {
  name: 'MainLayout',
  components: {
    Sidebar
  },
  data() {
    return {
      isMaximized: false
    }
  },
  methods: {
    startDrag() {
      if (window.electronAPI) {
        window.electronAPI.startDrag()
      }
    },
    minimizeWindow() {
      if (window.electronAPI) {
        window.electronAPI.minimizeWindow()
      }
    },
    maximizeWindow() {
      this.isMaximized = !this.isMaximized
      if (window.electronAPI) {
        window.electronAPI.maximizeWindow()
      }
    },
    closeWindow() {
      if (window.electronAPI) {
        window.electronAPI.closeWindow()
      }
    }
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f2f3f5;
}

/* 自定义标题栏 */
.custom-titlebar {
  height: 32px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  -webkit-app-region: drag;
  user-select: none;
  border-bottom: 1px solid #34495e;
  z-index: 1000;
}

.titlebar-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 14px;
  font-weight: 500;
}

.titlebar-right {
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
}

.window-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: white;
  font-size: 12px;
  cursor: pointer;
  border-radius: 2px;
  margin-left: 4px;
  -webkit-app-region: no-drag;
}

.window-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.close-btn:hover {
  background-color: #e74c3c;
}

.btn-icon {
  font-size: 10px;
  line-height: 1;
}

/* 主内容区域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background-color: #f2f3f5;
  height: 100%;
  min-height: 0;
}
</style>
