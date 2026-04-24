const { exec, spawn } = require('child_process')
const { promisify } = require('util')
const https = require('https')
const fs = require('fs')
const path = require('path')
const os = require('os')

const execPromise = promisify(exec)

class AutoInstaller {
  constructor(options = {}) {
    this.progressCallback = options.onProgress || (() => {})
    this.errorCallback = options.onError || ((err) => console.error('安装错误:', err))
    this.completedCallback = options.onCompleted || (() => {})
  }

  async installNodeJS() {
    this.progressCallback({
      step: 'nodejs',
      status: 'installing',
      message: '正在安装 Node.js...'
    })

    try {
      if (!await this.isHomebrewInstalled()) {
        this.progressCallback({
          step: 'homebrew',
          status: 'installing',
          message: '首先安装 Homebrew...'
        })
        await this.installHomebrew()
      }

      this.progressCallback({
        step: 'nodejs',
        status: 'installing',
        message: '通过 Homebrew 安装 Node.js...'
      })

      await this.runCommand('brew install node')

      const version = await this.runCommand('node --version')
      this.progressCallback({
        step: 'nodejs',
        status: 'completed',
        message: `Node.js ${version.trim()} 安装成功!`
      })

      return { success: true, version: version.trim() }
    } catch (error) {
      this.errorCallback({
        step: 'nodejs',
        error: error.message
      })
      throw error
    }
  }

  async installHomebrew() {
    try {
      const installCommand = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'

      await this.runCommand(installCommand)

      this.progressCallback({
        step: 'homebrew',
        status: 'completed',
        message: 'Homebrew 安装成功!'
      })

      return { success: true }
    } catch (error) {
      this.errorCallback({
        step: 'homebrew',
        error: error.message
      })
      throw error
    }
  }

  async isHomebrewInstalled() {
    try {
      await this.runCommand('brew --version', { timeout: 5000 })
      return true
    } catch (error) {
      return false
    }
  }

  async downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destination)
      const request = https.get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location
          https.get(redirectUrl, (redirectResponse) => {
            redirectResponse.pipe(file)
            file.on('finish', () => {
              file.close()
              resolve(destination)
            })
          }).on('error', (err) => {
            fs.unlink(destination, () => {})
            reject(err)
          })
        } else {
          response.pipe(file)
          file.on('finish', () => {
            file.close()
            resolve(destination)
          })
        }
      }).on('error', (err) => {
        fs.unlink(destination, () => {})
        reject(err)
      })
    })
  }

  async installPrinterDriver() {
    this.progressCallback({
      step: 'printer',
      status: 'installing',
      message: '正在打开汉印驱动下载页面...'
    })

    try {
      const { shell } = require('electron')

      await shell.openExternal('https://cn.hprt.com/XiaZai.html')

      this.progressCallback({
        step: 'printer',
        status: 'manual',
        message: '请在打开的页面中下载并安装汉印N31BT Mac版驱动，安装完成后重启应用'
      })

      return {
        success: true,
        manual: true,
        message: '需要手动下载安装驱动'
      }
    } catch (error) {
      this.errorCallback({
        step: 'printer',
        error: error.message
      })
      throw error
    }
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32'
      const shell = isWindows ? 'cmd.exe' : '/bin/bash'
      const shellArgs = isWindows ? ['/c', command] : ['-c', command]

      const child = spawn(shell, shellArgs, {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, PATH: process.env.PATH },
        timeout: options.timeout || 300000
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        const output = data.toString()
        stdout += output
        if (options.verbose) {
          console.log(output)
        }
      })

      child.stderr.on('data', (data) => {
        const output = data.toString()
        stderr += output
        if (options.verbose) {
          console.error(output)
        }
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error(`命令执行失败 (${code}): ${stderr || stdout}`))
        }
      })

      child.on('error', (error) => {
        reject(error)
      })

      if (options.timeout) {
        setTimeout(() => {
          child.kill()
          reject(new Error('命令执行超时'))
        }, options.timeout)
      }
    })
  }

  async setupMacEnvironment() {
    const results = {
      nodejs: null,
      homebrew: null,
      printer: null
    }

    try {
      if (!await this.isHomebrewInstalled()) {
        this.progressCallback({
          step: 'homebrew',
          status: 'installing',
          message: '正在安装 Homebrew (Mac包管理器)...'
        })

        try {
          await this.installHomebrew()
          results.homebrew = { success: true }
        } catch (error) {
          console.error('Homebrew 安装失败:', error)
          results.homebrew = { success: false, error: error.message }
        }
      } else {
        results.homebrew = { success: true, message: 'Homebrew 已安装' }
        this.progressCallback({
          step: 'homebrew',
          status: 'completed',
          message: 'Homebrew 已安装'
        })
      }

      if (!await this.isNodeJSInstalled()) {
        this.progressCallback({
          step: 'nodejs',
          status: 'installing',
          message: '正在安装 Node.js...'
        })

        try {
          const version = await this.runCommand('brew install node')
          results.nodejs = { success: true, version: version.trim() }
        } catch (error) {
          console.error('Node.js 安装失败:', error)
          results.nodejs = { success: false, error: error.message }
        }
      } else {
        const version = await this.runCommand('node --version')
        results.nodejs = { success: true, version: version.trim(), message: 'Node.js 已安装' }
        this.progressCallback({
          step: 'nodejs',
          status: 'completed',
          message: `Node.js 已安装 (${version.trim()})`
        })
      }

      this.completedCallback(results)

      return results
    } catch (error) {
      this.errorCallback({
        step: 'setup',
        error: error.message
      })
      throw error
    }
  }

  async isNodeJSInstalled() {
    try {
      await this.runCommand('node --version', { timeout: 5000 })
      return true
    } catch (error) {
      return false
    }
  }

  async checkAndInstallDependencies() {
    const checker = require('./systemChecker')
    const systemChecker = new checker()
    const results = await systemChecker.checkAll()

    const recommendations = systemChecker.getRecommendations()
    const installResults = {}

    for (const rec of recommendations) {
      if (rec.type === 'critical' && rec.autoInstallable) {
        try {
          switch (rec.action) {
            case 'install_nodejs':
              installResults.nodejs = await this.installNodeJS()
              break
            case 'install_homebrew':
              installResults.homebrew = await this.installHomebrew()
              break
          }
        } catch (error) {
          installResults[rec.action] = {
            success: false,
            error: error.message
          }
        }
      }
    }

    return {
      systemResults: results,
      installResults: installResults
    }
  }
}

module.exports = AutoInstaller
