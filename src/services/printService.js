import { generateLabel, createLabelPrinter, ESC } from './printer/escpos.js'
import USBPrinter from './printer/usb.js'
import BluetoothPrinter from './printer/bluetooth.js'

let currentPrinter = null
let usbPrinter = null
let bluetoothPrinter = null
let connectionType = null

const HPRT_VENDOR_ID = 0x0483
const HPRT_PRODUCT_ID = 0x5720

export default {
  async getPrinters() {
    const printers = [
      {
        id: 1,
        name: '汉印 N31BT (USB)',
        model: 'N31BT',
        connectionType: 'USB',
        status: 'available'
      },
      {
        id: 2,
        name: '汉印 N31BT (蓝牙)',
        model: 'N31BT',
        connectionType: 'Bluetooth',
        status: BluetoothPrinter.isSupported() ? 'available' : 'unsupported'
      },
      {
        id: 3,
        name: '测试打印机 (模拟)',
        model: 'Virtual',
        connectionType: 'Virtual',
        status: 'available'
      }
    ]

    return printers
  },

  async connect(printerInfo) {
    try {
      currentPrinter = printerInfo
      connectionType = printerInfo.connectionType

      if (printerInfo.connectionType === 'USB') {
        usbPrinter = new USBPrinter()
        await usbPrinter.connect(HPRT_VENDOR_ID, HPRT_PRODUCT_ID)
        console.log('USB打印机连接成功')
        return true
      } else if (printerInfo.connectionType === 'Bluetooth') {
        bluetoothPrinter = new BluetoothPrinter()
        await bluetoothPrinter.connect('N31BT')
        console.log('蓝牙打印机连接成功')
        return true
      } else {
        console.log('虚拟打印机模式')
        return true
      }
    } catch (error) {
      console.error('连接打印机失败:', error)
      throw error
    }
  },

  async disconnect() {
    try {
      if (usbPrinter) {
        await usbPrinter.disconnect()
        usbPrinter = null
      }
      if (bluetoothPrinter) {
        await bluetoothPrinter.disconnect()
        bluetoothPrinter = null
      }
      currentPrinter = null
      connectionType = null
      console.log('打印机已断开')
    } catch (error) {
      console.error('断开连接失败:', error)
    }
  },

  async sendToPrinter(data) {
    if (!currentPrinter) {
      throw new Error('未选择打印机')
    }

    if (connectionType === 'USB' && usbPrinter) {
      await usbPrinter.sendData(data)
    } else if (connectionType === 'Bluetooth' && bluetoothPrinter) {
      await bluetoothPrinter.sendData(data)
    } else {
      console.log('虚拟打印:', data.length, '字节')
    }
  },

  async testPrint(printerInfo) {
    console.log('========== 测试打印 ==========')
    console.log('打印时间:', new Date().toLocaleString('zh-CN'))
    console.log('打印机:', printerInfo?.name || '未指定')

    try {
      const printer = createLabelPrinter({
        width: 50,
        height: 30,
        printerType: 'HPRT_N31BT'
      })

      printer.init()
      printer.setAlignment('center')
      printer.printLine('===== 测试标签 =====', { bold: true, align: 'center' })
      printer.feedPaper(1)

      printer.setAlignment('left')
      printer.printLine('商品编号: Y0815', { align: 'left' })
      printer.printLine('买家昵称: 测试用户', { align: 'left' })
      printer.printLine('扣号内容: Y0815+已拍', { align: 'left' })
      printer.printLine(`扣号时间: ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`, { align: 'left' })
      printer.printLine('序号: #0001', { align: 'left' })
      printer.printLine('批次: 001', { align: 'left' })

      printer.feedPaper(3)
      printer.cutPaper(true)

      const data = printer.generate()

      if (connectionType === 'Virtual' || !connectionType) {
        console.log('测试打印内容预览:')
        console.log('  - 商品编号: Y0815')
        console.log('  - 买家昵称: 测试用户')
        console.log('  - 扣号内容: Y0815+已拍')
        console.log('  - 扣号时间:', new Date().toLocaleTimeString('zh-CN', { hour12: false }))
        console.log('==============================')
        return true
      }

      await this.sendToPrinter(data)
      console.log('测试打印成功!')
      console.log('==============================')
      return true
    } catch (error) {
      console.error('测试打印失败:', error)
      throw error
    }
  },

  async printLabel(order, template, options = {}) {
    console.log('========== 打印订单标签 ==========')
    console.log('序号:', order.serial || order.id)
    console.log('商品编号:', order.itemId || '-')
    console.log('买家昵称:', order.nickname || '-')
    console.log('扣号内容:', order.content || '-')
    console.log('扣号时间:', order.time || '-')
    console.log('批次号:', order.round || '-')

    try {
      const labelData = generateLabel(order, template, options)
      const data = labelData.generate()

      if (connectionType === 'Virtual' || !connectionType) {
        console.log('虚拟打印完成')
        console.log('================================')
        return true
      }

      await this.sendToPrinter(data)
      console.log('打印成功!')
      console.log('================================')
      return true
    } catch (error) {
      console.error('打印失败:', error)
      throw error
    }
  },

  async printLabels(orders, template, options = {}) {
    console.log('========== 批量打印 ==========')
    console.log('订单数量:', orders.length)

    let successCount = 0
    let failCount = 0

    for (const order of orders) {
      try {
        await this.printLabel(order, template, options)
        successCount++
      } catch (error) {
        console.error('打印订单失败:', order.id, error)
        failCount++
      }
    }

    console.log('批量打印完成:')
    console.log('  成功:', successCount)
    console.log('  失败:', failCount)
    console.log('==============================')

    return { successCount, failCount }
  },

  async getPrinterStatus() {
    try {
      if (usbPrinter) {
        return await usbPrinter.getStatus()
      }
      if (bluetoothPrinter) {
        return await bluetoothPrinter.getStatus()
      }
      return { connected: false, paperEmpty: false, error: false }
    } catch (error) {
      console.error('获取打印机状态失败:', error)
      return { connected: false, paperEmpty: false, error: true }
    }
  },

  async initializePrinter(printerInfo) {
    try {
      const printer = createLabelPrinter({
        width: 50,
        height: 30,
        printerType: 'HPRT_N31BT'
      })

      printer.init()

      const initCommands = [
        ...ESC.INIT,
        ...ESC.LINE_SPACING.DEFAULT,
        ...ESC.FONT.FONT_A,
        ...ESC.FONT.NORMAL,
        ...ESC.ALIGN.LEFT
      ]

      const data = new Uint8Array(initCommands)

      if (connectionType === 'Virtual' || !connectionType) {
        console.log('打印机初始化完成 (模拟)')
        return true
      }

      await this.sendToPrinter(data)
      console.log('打印机初始化完成')
      return true
    } catch (error) {
      console.error('打印机初始化失败:', error)
      throw error
    }
  },

  async close() {
    await this.disconnect()
  }
}
