# GitHub 设置指南

## 第1步：确认您的GitHub用户名

⚠️ 重要：GitHub用户名不是邮箱！

**如何查看您的GitHub用户名：**

1. 访问 https://github.com 并登录
2. 点击右上角的头像
3. 您的用户名会显示在下拉菜单中
4. 或者访问您的个人主页，URL是：`https://github.com/您的用户名`

---

## 第2步：创建新仓库

1. 访问：https://github.com/new
2. 填写：
   - Repository name: `koukou-fastprint`
   - Public/Private: 都可以
3. 点击 **Create repository**

---

## 第3步：在Windows上执行命令

### 方式A：使用我的用户名（假设是fzy1532）

如果您的GitHub用户名是 `fzy1532`，在PowerShell中执行：

```powershell
cd C:\Users\Ryan\Documents\trae_projects\RF_MCU_ATUART\BlitzOrder

git init
git add .
git commit -m "Initial commit for 扣扣快打"
git branch -M main
git remote add origin https://github.com/fzy1532/koukou-fastprint.git
git push -u origin main
```

### 方式B：使用您自己确认后的用户名

请先确认您的GitHub用户名，然后替换下面的 `您的用户名`：

```powershell
cd C:\Users\Ryan\Documents\trae_projects\RF_MCU_ATUART\BlitzOrder

git init
git add .
git commit -m "Initial commit for 扣扣快打"
git branch -M main
git remote add origin https://github.com/您的用户名/koukou-fastprint.git
git push -u origin main
```

---

## 第4步：如果push需要认证

如果出现认证问题：

### 创建Personal Access Token (推荐)

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token"
3. 选择 "Generate new token (classic)"
4. 勾选：`repo` (Full control of private repositories)
5. 点击 "Generate token"
6. ⚠️ 复制保存好这个token，只显示一次！

### 使用Token推送

当git要求输入密码时，粘贴刚才的token即可。

---

## 第5步：查看构建

推送成功后：

1. 访问您的仓库：https://github.com/您的用户名/koukou-fastprint
2. 点击顶部的 **Actions** 标签
3. 等待5-10分钟
4. 构建完成后，下载 `mac-builds`

---

## ❓ 如果忘记GitHub用户名

1. 登录GitHub
2. 访问：https://github.com/settings/profile
3. 查看 "Public profile" -> "Username"

---

## 🔧 备用方案

如果GitHub Actions太复杂，可以：
1. 先在Windows上测试功能
2. 找有Mac的朋友帮忙打包
3. 或者使用Mac云服务

---

**祝您成功！🎉**
