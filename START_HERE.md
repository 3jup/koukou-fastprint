# 🚀 立即开始 - 您的GitHub用户名: 3jup

## 第1步：在GitHub上创建仓库

访问：https://github.com/new

填写：
- Repository name: `koukou-fastprint`
- 选择 Public 或 Private
- 点击 **Create repository**

---

## 第2步：在PowerShell中执行以下命令（复制粘贴即可）

```powershell
cd C:\Users\Ryan\Documents\trae_projects\RF_MCU_ATUART\BlitzOrder

git init
git add .
git commit -m "Initial commit: 扣扣快打"
git branch -M main
git remote add origin https://github.com/3jup/koukou-fastprint.git
git push -u origin main
```

---

## 第3步：等待自动构建并下载！

推送成功后：

1. 访问：https://github.com/3jup/koukou-fastprint/actions
2. 等待5-10分钟，直到变成绿色 ✅
3. 点击进入该构建
4. 滚动到底部，找到 **Artifacts**
5. 点击 `mac-builds` 下载
6. 解压得到DMG文件！

---

## ⚠️ 如果push需要密码

创建Personal Access Token：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo`
4. 生成并复制token
5. push时用token当密码

---

## 就这么简单！🎉
