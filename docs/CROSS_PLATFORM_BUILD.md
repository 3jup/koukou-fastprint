# 跨平台打包指南 - Windows打包Mac应用

## 📋 目录

1. [方案一：GitHub Actions (推荐 ⭐)](#方案一github-actions-推荐)
2. [方案二：云服务器/Mac服务](#方案二云服务器mac服务)
3. [方案三：使用Docker (技术流)](#方案三使用docker-技术流)
4. [方案四：租赁Mac服务](#方案四租赁mac服务)
5. [准备工作](#准备工作)

---

## 方案一：GitHub Actions (推荐 ⭐)

**优点：**
- ✅ 完全免费
- ✅ 自动化构建
- ✅ 同时支持Mac/Windows/Linux
- ✅ 不需要自己的Mac

**缺点：**
- ⚠️ 需要GitHub账号
- ⚠️ 需要将代码推送到GitHub

### 步骤详解：

#### 1️⃣ 创建GitHub仓库

1. 访问 https://github.com
2. 点击 "New repository"
3. 填写仓库名称，例如：`koukou-fastprint`
4. 选择 Public 或 Private
5. 点击 "Create repository"

#### 2️⃣ 准备代码

我已经为您创建了配置文件！

```
.github/
└── workflows/
    ├── build-mac.yml      # 仅构建Mac版本
    └── build-all.yml      # 构建Mac/Windows/Linux三个版本
```

#### 3️⃣ 初始化Git (在Windows上操作)

打开 PowerShell 或 CMD，进入项目目录：

```powershell
cd C:\Users\Ryan\Documents\trae_projects\RF_MCU_ATUART\BlitzOrder
```

初始化Git：

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/您的用户名/koukou-fastprint.git
git push -u origin main
```

**注意：** 将 `您的用户名` 替换为您的GitHub用户名。

#### 4️⃣ 触发自动构建

推送代码后，GitHub会自动开始构建！

**查看构建状态：**
1. 访问您的GitHub仓库
2. 点击 "Actions" 标签
3. 查看正在运行的工作流

**手动触发构建：**
1. 进入 Actions
2. 选择 "Build All Platforms" 或 "Build Mac App"
3. 点击 "Run workflow"
4. 选择分支，点击 "Run workflow"

#### 5️⃣ 下载构建文件

构建完成后：
1. 进入具体的构建页面
2. 滚动到页面底部的 "Artifacts" 部分
3. 点击 `mac-builds` 下载
4. 解压后得到 `.dmg` 文件！

---

## 方案二：云服务器/Mac服务

### 选项A：Mac云服务器

**推荐平台：**
- https://www.macstadium.com/ (专业Mac云)
- https://www.scaleway.com/ (有Mac实例)
- https://aws.amazon.com/ec2/ (Mac1实例)

**操作步骤：**
1. 租用一台Mac云服务器
2. 远程连接
3. 安装Node.js, Git等
4. 克隆代码
5. 运行 `npm run electron:build:mac`
6. 下载生成的DMG文件

**费用：** 约 $30-100/月

---

### 选项B：GitHub Codespaces

**优点：**
- GitHub官方提供
- 免费额度 (每月120小时)
- 开箱即用

**操作：**
1. 在GitHub仓库点击 "Code"
2. 选择 "Codespaces"
3. 点击 "Create codespace on main"
4. 等待环境初始化
5. 运行打包命令
6. 下载生成的文件

**注意：** Codespaces的免费实例不一定是Mac，可能需要确认。

---

## 方案三：使用Docker (技术流)

**注意：** 这种方案比较复杂，建议有Docker经验使用。

### 使用dockbuild/electron镜像

创建 `Dockerfile`:

```dockerfile
FROM electronuserland/builder:wine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run electron:build:mac
```

但这种方案实际上并不能真正打包Mac应用，因为：
- Docker在Windows上只能运行Linux容器
- Mac的代码签名、DMG创建需要Mac系统API

**结论：** Docker不是最佳方案。

---

## 方案四：租赁Mac服务

### 推荐平台：

1. **MacinCloud** (https://www.macincloud.com/)
   - 按小时付费，$1-3/小时
   - 提供远程桌面访问
   - 可以安装开发工具

2. **HostMyApple** (https://www.hostmyapple.com/)
   - 月租约 $25起
   - 可以长期使用

3. **虚拟Mac服务**
   - 搜索"Mac cloud hosting"
   - 多家供应商可选

---

## 准备工作

### 1. 确保配置文件正确

我已为您创建了以下文件：

```
BlitzOrder/
├── .github/
│   └── workflows/
│       ├── build-mac.yml      # 仅Mac构建
│       └── build-all.yml      # 全平台构建
├── docs/
│   └── CROSS_PLATFORM_BUILD.md   # 本文档
└── ...
```

### 2. 检查package.json脚本

已有的构建命令：

```json
{
  "electron:build:mac": "vite build && electron-builder --mac --x64 --arm64",
  "electron:build:win": "vite build && electron-builder --win",
  "electron:build:linux": "vite build && electron-builder --linux"
}
```

### 3. 准备图标文件

构建前需要准备：

```
build/
├── icon.icns    # Mac图标 (必需)
├── icon.ico     # Windows图标
└── icon.png     # Linux图标
```

**临时解决方案：**
- 在真正打包前，可以先用项目中的SVG图标转换
- 或者使用electron-builder的默认图标
- 但推荐准备专业图标

---

## 快速开始 - GitHub Actions (最推荐)

### 第1步：注册GitHub账号
如果还没有，请访问 https://github.com 注册

### 第2步：创建仓库
按照上面的"方案一"创建仓库

### 第3步：上传代码

在Windows上运行：

```powershell
# 确保在项目目录
cd C:\Users\Ryan\Documents\trae_projects\RF_MCU_ATUART\BlitzOrder

# 初始化Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 重命名分支
git branch -M main

# 添加远程仓库 (替换为您的用户名)
git remote add origin https://github.com/您的用户名/koukou-fastprint.git

# 推送
git push -u origin main
```

### 第4步：下载DMG文件

1. 等待GitHub构建完成 (约5-10分钟)
2. 访问仓库的 Actions 页面
3. 找到最新的构建
4. 下载 Artifacts 中的 mac-builds
5. 解压得到DMG文件！

---

## ⚠️ 注意事项

### 代码签名

如果只是自己使用或测试，不签名也可以运行，但：
- Gatekeeper可能会阻止运行
- 用户需要右键 -> 打开

如果需要正式分发，需要：
- Apple开发者账号 ($99/年)
- 配置代码签名
- 配置公证 (Notarization)

### 首次打开DMG

在Mac上首次打开时：
1. 双击DMG文件
2. 拖拽到Applications
3. 右键 -> 打开 (因为未签名)
4. 确认打开

---

## 🎯 我的建议

**最佳方案：GitHub Actions**

理由：
1. 🆓 完全免费
2. ⚡ 自动化，省心
3. 🌐 同时支持三个平台
4. 📦 每次推送代码都会自动构建

**只需要：**
1. 一个GitHub账号
2. 将代码推送到GitHub
3. 等待5-10分钟下载DMG

---

## ❓ 常见问题

### Q: GitHub Actions安全吗？

A: 是的，非常安全！
- 可以创建Private仓库
- 只有您能看到和下载
- GitHub有完善的安全机制

### Q: 构建需要多长时间？

A: 通常 5-10分钟，取决于网络情况

### Q: 免费额度有限制吗？

A: GitHub免费账号：
- Public仓库：无限分钟
- Private仓库：2000分钟/月 (足够使用)

### Q: 可以只构建Mac版本吗？

A: 可以！我创建了两个workflow：
- `build-mac.yml` - 仅Mac
- `build-all.yml` - 全部三个平台

---

## 📞 需要帮助？

如果在操作过程中遇到问题：
1. 检查GitHub Actions的日志
2. 查看错误信息
3. 可以尝试调整配置

---

**祝您打包顺利！🎉**
