const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 打开开发者工具，方便调试
  mainWindow.webContents.openDevTools()

  // 打印调试信息
  console.log('📁 __dirname:', __dirname)
  console.log('📁 app.isPackaged:', app.isPackaged)
  console.log('📁 app.getAppPath():', app.getAppPath())
  
  // 尝试加载 dist/index.html
  const distIndexPath = path.join(__dirname, 'dist', 'index.html')
  console.log('📄 尝试加载:', distIndexPath)
  
  mainWindow.loadFile(distIndexPath).catch(err => {
    console.error('❌ 加载失败:', err)
  })
}

app.whenReady().then(() => {
  createWindow()

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
