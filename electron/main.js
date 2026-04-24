const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const os = require('os')

let mainWindow
let systemChecker = null
let autoInstaller = null

async function checkSystemEnvironment() {
  try {
    const SystemChecker = require('./services/systemChecker')
    const AutoInstaller = require('./services/autoInstaller')

    systemChecker = new SystemChecker()
    autoInstaller = new AutoInstaller({
      onProgress: (progress) => {
        console.log(`[${progress.step}] ${progress.status}: ${progress.message}`)
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('install-progress', progress)
        }
      },
      onError: (error) => {
        console.error(`[${error.step}] Error:`, error.error)
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('install-error', error)
        }
      },
      onCompleted: (results) => {
        console.log('安装完成:', results)
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('install-completed', results)
        }
      }
    })

    console.log('🔍 开始系统环境检测...')
    const results = await systemChecker.checkAll()
    console.log('检测结果:', results)

    const recommendations = systemChecker.getRecommendations()
    const status = systemChecker.getSystemStatus()

    console.log('系统就绪状态:', status)

    return {
      results: results,
      recommendations: recommendations,
      status: status
    }
  } catch (error) {
    console.error('系统检测失败:', error)
    return {
      results: null,
      recommendations: [],
      status: { ready: false, error: error.message }
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: '扣扣快打',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  console.log('========================================')
  console.log('🚀 扣扣快打启动中...')
  console.log(`📱 系统: ${os.platform()} ${os.release()}`)
  console.log(`💻 架构: ${os.arch()}`)
  console.log('========================================')

  if (process.platform === 'darwin') {
    const checkResult = await checkSystemEnvironment()

    if (!checkResult.status.ready) {
      console.log('⚠️ 系统环境检测到问题，需要引导配置')
      createWindow()

      if (mainWindow) {
        mainWindow.webContents.on('did-finish-load', () => {
          mainWindow.webContents.send('system-check-result', checkResult)
        })
      }
    } else {
      console.log('✅ 系统环境检测通过，创建主窗口')
      createWindow()
    }
  } else {
    console.log('非Mac系统，跳过部分检测')
    createWindow()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData')
})

ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    arch: os.arch(),
    version: os.release(),
    homedir: os.homedir(),
    hostname: os.hostname()
  }
})

ipcMain.handle('system-check', async () => {
  return await checkSystemEnvironment()
})

ipcMain.handle('auto-install', async (event, action) => {
  try {
    console.log('开始自动安装:', action)

    switch (action) {
      case 'install_nodejs':
        return await autoInstaller.installNodeJS()
      case 'install_homebrew':
        return await autoInstaller.installHomebrew()
      case 'install_printer':
        return await autoInstaller.installPrinterDriver()
      case 'setup_all':
        return await autoInstaller.setupMacEnvironment()
      default:
        throw new Error(`未知的安装动作: ${action}`)
    }
  } catch (error) {
    console.error('自动安装失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('recheck-system', async () => {
  return await checkSystemEnvironment()
})

ipcMain.handle('open-external', async (event, url) => {
  const { shell } = require('electron')
  return await shell.openExternal(url)
})

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options)
  return result
})
