class USBPrinter {
  constructor() {
    this.device = null
    this.endpointOut = null
    this.endpointIn = null
    this.isConnected = false
  }

  async connect(vendorId, productId) {
    try {
      if (!navigator.usb) {
        throw new Error('WebUSB not supported in this browser')
      }

      const devices = await navigator.usb.getDevices()
      let device = devices.find(d =>
        d.vendorId === vendorId && d.productId === productId
      )

      if (!device) {
        device = await navigator.usb.requestDevice({
          filters: [{ vendorId, productId }]
        })
      }

      await device.open()

      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }

      const interfaces = device.configuration.interfaces
      for (const iface of interfaces) {
        for (const altsetting of iface.alternates) {
          if (altsetting.interfaceClass === 7) {
            await device.claimInterface(altsetting.interfaceNumber)

            for (const endpoint of altsetting.endpoints) {
              if (endpoint.direction === 'out') {
                this.endpointOut = endpoint.endpointNumber
              } else if (endpoint.direction === 'in') {
                this.endpointIn = endpoint.endpointNumber
              }
            }
          }
        }
      }

      this.device = device
      this.isConnected = true
      console.log('USB打印机连接成功')
      return true
    } catch (error) {
      console.error('USB连接失败:', error)
      this.isConnected = false
      throw error
    }
  }

  async sendData(data) {
    if (!this.isConnected || !this.device) {
      throw new Error('打印机未连接')
    }

    try {
      const buffer = data instanceof Uint8Array ? data : new Uint8Array(data)
      await this.device.transferOut(this.endpointOut, buffer)
      console.log('数据发送成功, 字节数:', buffer.length)
      return true
    } catch (error) {
      console.error('发送数据失败:', error)
      throw error
    }
  }

  async readData(length = 64) {
    if (!this.isConnected || !this.device || !this.endpointIn) {
      throw new Error('打印机未连接或不支持读取')
    }

    try {
      const result = await this.device.transferIn(this.endpointIn, length)
      return new Uint8Array(result.data.buffer)
    } catch (error) {
      console.error('读取数据失败:', error)
      return null
    }
  }

  async disconnect() {
    if (this.device) {
      try {
        await this.device.close()
        this.device = null
        this.endpointOut = null
        this.endpointIn = null
        this.isConnected = false
        console.log('USB打印机已断开')
      } catch (error) {
        console.error('断开连接失败:', error)
      }
    }
  }

  async getStatus() {
    if (!this.isConnected) {
      return { connected: false, paperEmpty: false, error: false }
    }

    try {
      const status = await this.readData(1)
      if (status && status.length > 0) {
        return {
          connected: true,
          paperEmpty: !!(status[0] & 0x20),
          error: !!(status[0] & 0x04)
        }
      }
    } catch (error) {
      console.error('获取状态失败:', error)
    }

    return { connected: true, paperEmpty: false, error: false }
  }

  static getPrinterInfo() {
    return {
      name: '汉印 N31BT',
      vendorId: 0x0483,
      productId: 0x5720,
      type: 'USB',
      supported: !!navigator.usb
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = USBPrinter
} else if (typeof window !== 'undefined' || typeof self !== 'undefined') {
  // 浏览器环境
}

// ES6 导出
export default USBPrinter
