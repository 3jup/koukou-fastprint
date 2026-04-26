const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // 无边框窗口
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  // 直接加载 vite-dist/index.html
  const indexPath = path.join(__dirname, '../vite-dist/index.html')
  console.log('加载文件:', indexPath)
  win.loadFile(indexPath)

  // 打开开发者工具
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
