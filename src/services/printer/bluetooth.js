class BluetoothPrinter {
  constructor() {
    this.device = null
    this.server = null
    this.service = null
    this.characteristic = null
    this.isConnected = false
    this.deviceName = 'N31BT'
    this.serviceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb'
    this.characteristicUUID = '0000ffe1-0000-1000-8000-00805f9b34fb'
  }

  async connect(deviceName = 'N31BT') {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth not supported in this browser')
      }

      this.deviceName = deviceName

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: deviceName },
          { namePrefix: 'HPRT' },
          { namePrefix: 'N31' }
        ],
        optionalServices: [this.serviceUUID]
      })

      device.addEventListener('gattserverdisconnected', () => {
        console.log('蓝牙连接断开')
        this.isConnected = false
        this.handleDisconnect()
      })

      const server = await device.gatt.connect()
      const service = await server.getPrimaryService(this.serviceUUID)
      const characteristic = await service.getCharacteristic(this.characteristicUUID)

      this.device = device
      this.server = server
      this.service = service
      this.characteristic = characteristic
      this.isConnected = true

      console.log('蓝牙打印机连接成功:', device.name)
      return true
    } catch (error) {
      console.error('蓝牙连接失败:', error)
      this.isConnected = false
      throw error
    }
  }

  async sendData(data) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('打印机未连接')
    }

    try {
      const buffer = data instanceof Uint8Array ? data : new Uint8Array(data)
      await this.characteristic.writeValue(buffer)
      console.log('数据发送成功, 字节数:', buffer.length)
      return true
    } catch (error) {
      console.error('发送数据失败:', error)
      throw error
    }
  }

  async readData() {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('打印机未连接')
    }

    try {
      const result = await this.characteristic.readValue()
      return new Uint8Array(result.buffer)
    } catch (error) {
      console.error('读取数据失败:', error)
      return null
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      try {
        this.device.gatt.disconnect()
        console.log('蓝牙打印机已断开')
      } catch (error) {
        console.error('断开连接失败:', error)
      }
    }

    this.device = null
    this.server = null
    this.service = null
    this.characteristic = null
    this.isConnected = false
  }

  handleDisconnect() {
    console.log('蓝牙连接已断开，尝试重新连接...')
    setTimeout(async () => {
      if (this.deviceName) {
        try {
          await this.connect(this.deviceName)
          console.log('重新连接成功')
        } catch (error) {
          console.error('重新连接失败:', error)
        }
      }
    }, 3000)
  }

  async getStatus() {
    if (!this.isConnected) {
      return { connected: false, paperEmpty: false, error: false }
    }

    try {
      const status = await this.readData()
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

  static async getAvailableDevices() {
    if (!navigator.bluetooth) {
      return []
    }

    try {
      const devices = await navigator.bluetooth.getDevices()
      return devices
        .filter(d => d.name && (d.name.includes('N31') || d.name.includes('HPRT')))
        .map(d => ({
          name: d.name,
          id: d.id
        }))
    } catch (error) {
      console.error('获取设备列表失败:', error)
      return []
    }
  }

  static isSupported() {
    return !!navigator.bluetooth
  }

  static getPrinterInfo() {
    return {
      name: '汉印 N31BT (蓝牙版)',
      type: 'Bluetooth',
      supported: !!navigator.bluetooth,
      serviceUUID: '0000ffe0-0000-1000-8000-00805f9b34fb',
      characteristicUUID: '0000ffe1-0000-1000-8000-00805f9b34fb'
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BluetoothPrinter
} else if (typeof window !== 'undefined' || typeof self !== 'undefined') {
  // 浏览器环境
}

// ES6 导出
export default BluetoothPrinter
