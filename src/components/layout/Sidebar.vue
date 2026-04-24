<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo-section">
        <div class="logo-icon">🚀</div>
        <h2 class="app-title">扣扣快打</h2>
      </div>
    </div>
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <div class="nav-icon-wrapper">
          <span class="nav-icon">{{ item.icon }}</span>
        </div>
        <span class="nav-text">{{ item.name }}</span>
      </router-link>
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">👤</div>
        <div class="user-detail">
          <div class="user-name">用户</div>
          <div class="user-role">免费版</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      navItems: [
        { path: '/', name: '扣扣快打', icon: '🖨️' },
        { path: '/douyin-config', name: '抖音配置', icon: '📱' },
        { path: '/print-template', name: '打印模板', icon: '📄' },
        { path: '/order-remark', name: '订单备注', icon: '✏️' },
        { path: '/buyer-manager', name: '买家管理', icon: '👥' },
        { path: '/system-settings', name: '系统设置', icon: '⚙️' },
        { path: '/account', name: '我的账户', icon: '👤' }
      ]
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #1d2935 0%, #0f161e 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  line-height: 1;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 8px;
  gap: 12px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-item.active {
  background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.nav-icon {
  font-size: 18px;
  line-height: 1;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.user-avatar {
  font-size: 24px;
  line-height: 1;
}

.user-detail {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 2px;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
