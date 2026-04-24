# 弹幕捕手 - 快速开始指南

## 📚 目录

- [项目简介](#项目简介)
- [功能特色](#功能特色)
- [快速开始](#快速开始)
- [技术栈](#技术栈)
- [项目结构](#项目结构)

---

## 📖 项目简介

**弹幕捕手**是一款专为直播带货场景设计的智能打单工具，支持抖音、淘宝等平台的弹幕扣号自动识别和打印。

---

## ✨ 功能特色

### 核心功能
- ✅ **多平台支持** - 抖音、淘宝直播弹幕
- ✅ **智能规则引擎** - 9种扣号规则
- ✅ **自动打印** - 汉印N31BT打印机驱动
- ✅ **批量处理** - 高峰时段性能优化
- ✅ **黑名单管理** - 防刷屏多打
- ✅ **灯牌优先** - 粉丝专属功能
- ✅ **打印模板** - 可定制的标签格式

### Mac智能配置
- ✅ **自动检测** - 启动时检查系统环境
- ✅ **自动安装** - Node.js、Homebrew一键安装
- ✅ **驱动引导** - 打印机驱动安装向导

---

## 🚀 快速开始

### 前置要求

- MacOS 10.15 (Catalina) 或更高版本
- 至少4GB RAM
- 建议使用汉印N31BT打印机

### 安装步骤

#### 方案A：使用预编译包（推荐）

1. 下载最新的DMG安装包
2. 双击打开安装包
3. 拖拽"扣扣快打"到应用程序文件夹
4. 从启动台或应用程序文件夹启动

#### 方案B：从源码构建

```bash
# 1. 克隆项目
cd /path/to/BlitzOrder

# 2. 安装依赖
npm install

# 3. 开发模式运行
npm run electron:dev

# 4. 打包
npm run electron:build:mac
```

### 首次使用向导

应用首次启动时会自动进行系统检测：

1. **环境检测** - 自动检查Node.js、打印机等
2. **按需安装** - 缺少组件时提供自动安装
3. **配置完成** - 就绪后进入主界面

---

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | Vue 3 | ^3.3.4 |
| **UI 组件库** | Element Plus | ^2.4.0 |
| **状态管理** | Vuex | ^4.1.0 |
| **路由** | Vue Router | ^4.2.4 |
| **构建工具** | Vite | ^4.4.9 |
| **桌面框架** | Electron | ^25.0.0 |
| **打包工具** | electron-builder | ^23.6.0 |

---

## 📁 项目结构

```
BlitzOrder/
├── electron/                  # Electron主进程
│   ├── main.js               # 主入口文件
│   ├── preload.js            # 预加载脚本
│   └── services/             # 系统服务
│       ├── systemChecker.js  # 系统检测
│       └── autoInstaller.js  # 自动安装
├── src/                      # Vue应用源码
│   ├── components/           # 组件
│   │   └── layout/          # 布局组件
│   ├── views/               # 页面视图
│   │   ├── DanmakuPrint.vue # 扣打打印
│   │   ├── SystemSetup.vue  # 系统配置
│   │   └── ...
│   ├── services/            # 业务服务
│   │   ├── printer/        # 打印相关
│   │   ├── platform/       # 平台对接
│   │   └── ...
│   ├── store/              # Vuex状态管理
│   ├── router/             # 路由配置
│   └── main.js             # 应用入口
├── build/                   # 打包资源
├── docs/                    # 文档
├── dist/                    # 构建输出
├── release/                 # 打包输出
├── electron-builder.config.js # 打包配置
└── package.json            # 项目配置
```

---

## 🎯 使用流程

### 1. 配置店铺
- 添加直播店铺信息
- 配置直播间ID
- 选择平台类型（抖音/淘宝）

### 2. 设置规则
- 选择扣号规则
- 配置关键词
- 设置尺码匹配

### 3. 连接打印机
- 选择汉印N31BT
- 配置USB/蓝牙连接
- 测试打印功能

### 4. 开始打单
- 开启自动监听
- 弹幕实时捕获
- 自动打印标签

---

## 📝 开发指南

### 开发命令

```bash
# 浏览器开发
npm run dev

# Electron开发
npm run electron:dev

# 仅构建前端
npm run build

# Mac打包
npm run electron:build:mac
```

### 调试技巧

1. **打开开发者工具** - 在Electron中按 `Cmd+Option+I`
2. **查看控制台输出** - 检查浏览器控制台和终端
3. **使用Vue DevTools** - 安装Vue DevTools浏览器扩展

---

## 🔧 打包部署

详细打包说明请参考：[DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📞 支持与反馈

如遇问题请参考：
- [FAQ & Troubleshooting](./docs/TROUBLESHOOTING.md)
- [功能说明文档](./docs/FEATURES.md)

---

## 📄 许可证

MIT License

---

*祝您使用愉快！*
