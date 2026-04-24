# 🚀 GitHub Actions 打包 - 快速开始指南

## 3分钟上手！

### 前提条件
- ✅ 已有GitHub账号
- ✅ 代码已准备好

---

## 第1步：创建GitHub仓库 (2分钟)

1. 访问 https://github.com/new
2. 填写：
   - Repository name: `koukou-fastprint`
   - 选择 Public 或 Private
3. 点击 **Create repository**

---

## 第2步：在Windows上执行命令 (1分钟)

打开 PowerShell，逐行执行：

```powershell
# 进入项目目录
cd C:\Users\Ryan\Documents\trae_projects\RF_MCU_ATUART\BlitzOrder

# 初始化Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit for 扣扣快打"

# 重命名分支为 main
git branch -M main

# ⚠️  请将下面的 您的用户名 替换为您的GitHub用户名！
git remote add origin https://github.com/您的用户名/koukou-fastprint.git

# 推送到GitHub
git push -u origin main
```

**⚠️  重要：** 一定要把 `您的用户名` 换成您真实的GitHub用户名！

---

## 第3步：等待自动构建 (5-10分钟)

1. 访问您的GitHub仓库页面
2. 点击顶部的 **Actions** 标签
3. 看到正在运行的工作流了吗？
4. 等待它变成绿色的 ✅

---

## 第4步：下载DMG文件！

构建完成后：
1. 进入那个绿色的构建页面
2. 滚动到页面底部
3. 找到 **Artifacts** 区域
4. 点击 `mac-builds` 下载
5. 解压，得到 `.dmg` 文件！

---

## 就这么简单！🎉

---

## ❓ 遇到问题？

### 问题1: git push 失败
**解决方案：**
- 检查GitHub用户名是否正确
- 确认仓库已创建
- 可能需要GitHub Personal Access Token

### 问题2: Git找不到命令
**解决方案：**
- 安装Git：https://git-scm.com/download/win
- 重启PowerShell

### 问题3: 构建失败
**解决方案：**
- 在GitHub Actions中查看日志
- 检查是否有文件缺失

---

## 📚 详细文档

需要更详细的说明？
- 查看 `docs/CROSS_PLATFORM_BUILD.md`

---

**祝您打包顺利！🚀**
