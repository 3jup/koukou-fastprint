const { exec, spawn } = require('child_process')
const { promisify } = require('util')

const execPromise = promisify(exec)

class SystemChecker {
  constructor() {
    this.results = {
      nodejs: null,
      homebrew: null,
      printer: null,
      webBluetooth: null,
      webUSB: null
    }
  }

  async checkAll() {
    console.log('🔍 开始系统环境检测...')

    try {
      const checks = await Promise.allSettled([
        this.checkNodeJS(),
        this.checkHomebrew(),
        this.checkPrinter(),
        this.checkWebBluetooth(),
        this.checkWebUSB()
      ])

      this.results.nodejs = checks[0].status === 'fulfilled' ? checks[0].value : { installed: false, error: checks[0].reason?.message }
      this.results.homebrew = checks[1].status === 'fulfilled' ? checks[1].value : { installed: false, error: checks[1].reason?.message }
      this.results.printer = checks[2].status === 'fulfilled' ? checks[2].value : { installed: false, error: checks[2].reason?.message }
      this.results.webBluetooth = checks[3].status === 'fulfilled' ? checks[3].value : { installed: false, error: checks[3].reason?.message }
      this.results.webUSB = checks[4].status === 'fulfilled' ? checks[4].value : { installed: false, error: checks[4].reason?.message }

      console.log('✅ 系统检测完成')
      return this.results
    } catch (error) {
      console.error('❌ 系统检测失败:', error)
      throw error
    }
  }

  async checkNodeJS() {
    try {
      const { stdout } = await execPromise('node --version', { timeout: 5000 })
      const version = stdout.trim()

      const npmVersion = await this.getNPMPackageVersion()

      return {
        installed: true,
        version: version,
        npmVersion: npmVersion,
        path: await this.getCommandPath('node'),
        status: 'ok',
        message: `Node.js ${version} 已安装`
      }
    } catch (error) {
      return {
        installed: false,
        version: null,
        npmVersion: null,
        path: null,
        status: 'missing',
        message: 'Node.js 未安装',
        error: error.message
      }
    }
  }

  async getNPMPackageVersion() {
    try {
      const { stdout } = await execPromise('npm --version', { timeout: 5000 })
      return stdout.trim()
    } catch (error) {
      return null
    }
  }

  async getCommandPath(command) {
    try {
      const { stdout } = await execPromise(`which ${command}`, { timeout: 5000 })
      return stdout.trim()
    } catch (error) {
      return null
    }
  }

  async checkHomebrew() {
    try {
      const { stdout } = await execPromise('brew --version', { timeout: 5000 })
      const version = stdout.trim()

      return {
        installed: true,
        version: version,
        path: await this.getCommandPath('brew'),
        status: 'ok',
        message: 'Homebrew 已安装'
      }
    } catch (error) {
      return {
        installed: false,
        version: null,
        path: null,
        status: 'missing',
        message: 'Homebrew 未安装',
        error: error.message
      }
    }
  }

  async checkPrinter() {
    try {
      const printers = await this.getMacPrinters()

      const hasHPRT = printers.some(p =>
        p.toLowerCase().includes('hprt') ||
        p.toLowerCase().includes('n31')
      )

      return {
        installed: hasHPRT,
        printers: printers,
        hasHPRTPrinter: hasHPRT,
        status: hasHPRT ? 'ok' : 'missing',
        message: hasHPRT ? '检测到汉印打印机' : '未检测到汉印打印机',
        recommendation: hasHPRT ? null : '请安装汉印N31BT打印机驱动'
      }
    } catch (error) {
      return {
        installed: false,
        printers: [],
        hasHPRTPrinter: false,
        status: 'error',
        message: '检查打印机失败',
        error: error.message
      }
    }
  }

  async getMacPrinters() {
    try {
      const { stdout } = await execPromise('lpstat -p', { timeout: 5000 })
      const lines = stdout.split('\n').filter(line => line.includes('printer'))

      return lines.map(line => {
        const match = line.match(/printer\s+(\S+)/)
        return match ? match[1] : ''
      }).filter(Boolean)
    } catch (error) {
      return []
    }
  }

  async checkWebBluetooth() {
    try {
      return {
        supported: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
        status: typeof navigator !== 'undefined' && 'bluetooth' in navigator ? 'ok' : 'unsupported',
        message: typeof navigator !== 'undefined' && 'bluetooth' in navigator
          ? 'Web Bluetooth API 可用'
          : 'Web Bluetooth API 不可用'
      }
    } catch (error) {
      return {
        supported: false,
        status: 'error',
        message: 'Web Bluetooth 检测失败',
        error: error.message
      }
    }
  }

  async checkWebUSB() {
    try {
      return {
        supported: typeof navigator !== 'undefined' && 'usb' in navigator,
        status: typeof navigator !== 'undefined' && 'usb' in navigator ? 'ok' : 'unsupported',
        message: typeof navigator !== 'undefined' && 'usb' in navigator
          ? 'Web USB API 可用'
          : 'Web USB API 不可用'
      }
    } catch (error) {
      return {
        supported: false,
        status: 'error',
        message: 'Web USB 检测失败',
        error: error.message
      }
    }
  }

  getRecommendations() {
    const recommendations = []

    if (!this.results.nodejs?.installed) {
      recommendations.push({
        type: 'critical',
        title: '安装 Node.js',
        description: 'Node.js 是运行扣扣快打的必要环境',
        action: 'install_nodejs',
        command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && brew install node',
        autoInstallable: true
      })
    }

    if (!this.results.homebrew?.installed) {
      recommendations.push({
        type: 'critical',
        title: '安装 Homebrew',
        description: 'Homebrew 是 Mac 上的包管理器，用于安装其他软件',
        action: 'install_homebrew',
        command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        autoInstallable: true
      })
    }

    if (!this.results.printer?.hasHPRTPrinter) {
      recommendations.push({
        type: 'warning',
        title: '安装打印机驱动',
        description: '汉印N31BT打印机驱动未安装或未检测到',
        action: 'install_printer',
        url: 'https://cn.hprt.com/XiaZai.html',
        autoInstallable: false,
        manualAction: '请前往汉印官网下载并安装N31BT Mac版驱动'
      })
    }

    if (this.results.printer?.hasHPRTPrinter) {
      recommendations.push({
        type: 'success',
        title: '打印机就绪',
        description: '汉印打印机已正确安装',
        action: 'none'
      })
    }

    return recommendations
  }

  getSystemStatus() {
    const checks = Object.values(this.results)
    const allPassed = checks.every(r => r?.status === 'ok' || r?.status === 'missing' && r?.installed === false)

    return {
      ready: this.results.nodejs?.installed && this.results.printer?.hasHPRTPrinter,
      allChecksPassed: allPassed,
      summary: {
        nodejs: this.results.nodejs?.status,
        homebrew: this.results.homebrew?.status,
        printer: this.results.printer?.status,
        webBluetooth: this.results.webBluetooth?.status,
        webUSB: this.results.webUSB?.status
      }
    }
  }
}

module.exports = SystemChecker
