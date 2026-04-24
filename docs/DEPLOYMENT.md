# 弹幕捕手 - 打包部署指南

## 📋 目录

- [环境准备](#环境准备)
- [快速开始](#快速开始)
- [Mac打包](#mac打包)
- [Windows打包](#windows打包)
- [Linux打包](#linux打包)
- [发布流程](#发布流程)
- [常见问题](#常见问题)

---

## 🚀 环境准备

### 必需软件

1. **Node.js** (v16 或更高)
   ```bash
   node --version
   ```

2. **npm** 或 **yarn**
   ```bash
   npm --version
   ```

3. **Git** (可选，用于版本控制)

### Mac专用工具

1. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Homebrew** (推荐)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

---

## 📦 快速开始

### 1. 克隆/进入项目

```bash
cd /path/to/BlitzOrder
```

### 2. 安装依赖

```bash
npm install
```

### 3. 开发模式运行

```bash
npm run dev          # 浏览器开发模式
npm run electron:dev # Electron桌面开发模式
```

---

## 🍎 Mac打包

### 通用Mac打包（同时构建x64和arm64）

```bash
npm run electron:build:mac
```

### 特定架构打包

```bash
# Intel (x64)
npm run electron:build:mac:x64

# Apple Silicon (arm64/M1/M2/M3)
npm run electron:build:mac:arm64
```

### 输出文件位置

打包完成后，文件会在 `release/` 目录：

```
release/
├── 扣扣快打-1.0.0-arm64.dmg       # Apple Silicon DMG安装包
├── 扣扣快打-1.0.0-arm64-mac.zip    # Apple Silicon ZIP压缩包
├── 扣扣快打-1.0.0-x64.dmg         # Intel DMG安装包
└── 扣扣快打-1.0.0-x64-mac.zip      # Intel ZIP压缩包
```

### 安装测试

1. 双击 `.dmg` 文件打开
2. 将"弹幕捕手"拖拽到"应用程序"
3. 从启动台或应用程序文件夹启动应用

### 开发者签名（可选，用于正式发布）

如果需要在其他Mac上直接运行而不经过Gatekeeper，需要代码签名：

```bash
# 查看可用证书
security find-identity -v -p codesigning

# 配置签名（修改electron-builder.config.js）
# 添加证书信息到mac配置
```

---

## 🪟 Windows打包

### 在Mac上打包Windows（需要Wine或交叉编译）

```bash
npm run electron:build:win
```

### 输出文件

```
release/
├── 弹幕捕手 Setup 1.0.0.exe       # NSIS安装程序
└── 弹幕捕手 1.0.0.exe             # 便携版
```

---

## 🐧 Linux打包

```bash
npm run electron:build:linux
```

输出：
- `.AppImage` - 通用Linux应用
- `.deb` - Debian/Ubuntu包

---

## 📝 发布流程

### 版本发布检查清单

- [ ] 更新 `package.json` 中的版本号
- [ ] 测试所有功能正常
- [ ] 在真实Mac上测试系统检测和安装流程
- [ ] 连接打印机测试打印功能
- [ ] 测试抖音弹幕连接（演示模式/真实模式）
- [ ] 清理临时文件
- [ ] 执行打包命令
- [ ] 测试安装包
- [ ] 上传分发

### 版本更新流程

```bash
# 1. 更新版本号
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0
npm version major   # 1.0.0 -> 2.0.0

# 2. 执行打包
npm run electron:build:mac

# 3. 测试安装包
# 双击release文件夹中的DMG安装测试
```

---

## 🔧 开发调试命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 浏览器开发模式 |
| `npm run electron:dev` | Electron开发模式（含热更新） |
| `npm run build` | 仅构建前端文件 |
| `npm run clean:build` | 清理构建缓存 |
| `npm run clean` | 完整清理（包括node_modules） |

---

## ❓ 常见问题

### Q: npm install 卡住或失败？

A: 更换国内镜像源：

```bash
npm config set registry https://registry.npmmirror.com
# 或者
npm install --registry=https://registry.npmmirror.com
```

### Q: Electron下载特别慢？

A: 配置Electron镜像：

```bash
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
```

### Q: 打包时提示"icon not found"？

A: 需要在 `build/` 文件夹添加图标文件：

- Mac: `build/icon.icns` (至少512x512)
- Windows: `build/icon.ico`
- Linux: `build/icon.png`

### Q: 测试模式可以，打包后某些功能不工作？

A: 检查：

1. `electron-builder.config.js` 的 `files` 配置是否包含所有必要文件
2. 检查 `console.log` 输出（打包后在应用程序目录的logs文件夹）
3. 使用 `npm run electron:dev` 先在开发模式测试

### Q: 如何修改应用名称？

A: 修改 `package.json` 中的 `productName`

### Q: 系统检测功能在Windows上如何处理？

A: 我们已经在代码中做了平台判断，Windows上会跳过Mac专用的检测项。

---

## 📞 获取帮助

如果遇到问题：

1. 检查控制台错误信息
2. 查看 Electron 官方文档
3. 检查浏览器控制台的 Network 请求
4. 联系技术支持

---

## 📄 许可证

MIT License

---

## 🔗 相关链接

- [Electron 官方文档](https://www.electronjs.org/docs)
- [electron-builder 文档](https://www.electron.build/)
- [汉印官网](https://cn.hprt.com/)
- [抖音开放平台](https://developer.open-douyin.com/)

---

*最后更新：2024年4月25日*
