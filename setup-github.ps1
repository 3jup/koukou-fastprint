# 扣扣快打 - GitHub 设置脚本
# ======================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  扣扣快打 - GitHub 自动设置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Git是否安装
try {
    git --version | Out-Null
    Write-Host "✅ Git 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ 未检测到 Git！" -ForegroundColor Red
    Write-Host "请先安装 Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit
}

# 获取GitHub用户名
Write-Host ""
Write-Host "请提供您的 GitHub 信息" -ForegroundColor Yellow
Write-Host ""

$githubUsername = Read-Host "请输入您的 GitHub 用户名 (不是邮箱！)"

if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    Write-Host "❌ 用户名不能为空！" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit
}

$repoName = "koukou-fastprint"

Write-Host ""
Write-Host "确认信息：" -ForegroundColor Yellow
Write-Host "  GitHub 用户名: $githubUsername" -ForegroundColor White
Write-Host "  仓库名称: $repoName" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "确认？(Y/N)"

if ($confirm -notmatch "^[Yy]") {
    Write-Host "已取消" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit
}

# 检查是否已初始化Git
if (-Not (Test-Path ".git")) {
    Write-Host ""
    Write-Host "初始化 Git..." -ForegroundColor Cyan
    git init
} else {
    Write-Host "✅ Git 已初始化" -ForegroundColor Green
}

# 添加所有文件
Write-Host ""
Write-Host "添加文件..." -ForegroundColor Cyan
git add .

# 提交
Write-Host ""
Write-Host "提交更改..." -ForegroundColor Cyan
git commit -m "Initial commit: 扣扣快打"

# 重命名分支
Write-Host ""
Write-Host "设置分支为 main..." -ForegroundColor Cyan
git branch -M main

# 设置远程仓库
$repoUrl = "https://github.com/$githubUsername/$repoName.git"
Write-Host ""
Write-Host "设置远程仓库: $repoUrl" -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $repoUrl

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 设置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "接下来的步骤：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 请确保已在 GitHub 创建仓库: $repoUrl" -ForegroundColor White
Write-Host "2. 然后运行: git push -u origin main" -ForegroundColor White
Write-Host "3. 访问 GitHub Actions 查看构建状态" -ForegroundColor White
Write-Host ""

$readyToPush = Read-Host "现在要推送吗？(Y/N)"

if ($readyToPush -match "^[Yy]") {
    Write-Host ""
    Write-Host "开始推送到 GitHub..." -ForegroundColor Cyan
    git push -u origin main
} else {
    Write-Host ""
    Write-Host "好的，稍后您可以手动运行: git push -u origin main" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "按回车键退出"
