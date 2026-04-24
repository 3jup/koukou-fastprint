const ESC = {
  INIT: [0x1b, 0x40],
  LF: [0x0a],

  ALIGN: {
    LEFT: [0x1b, 0x61, 0x00],
    CENTER: [0x1b, 0x61, 0x01],
    RIGHT: [0x1b, 0x61, 0x02]
  },

  FONT: {
    NORMAL: [0x1b, 0x21, 0x00],
    BOLD: [0x1b, 0x45, 0x01],
    DOUBLE_HEIGHT: [0x1b, 0x21, 0x10],
    DOUBLE_WIDTH: [0x1b, 0x21, 0x20],
    DOUBLE: [0x1b, 0x21, 0x30]
  },

  FONT_SIZE: {
    FONT_A: [0x1b, 0x4d, 0x00],
    FONT_B: [0x1b, 0x4d, 0x01]
  },

  LINE_SPACING: {
    DEFAULT: [0x1b, 0x32],
    SET: [0x1b, 0x33]
  },

  CUT: {
    PARTIAL: [0x1d, 0x56, 0x01],
    FULL: [0x1d, 0x56, 0x00]
  },

  FEED: {
    LINE: [0x1b, 0x64, 0x01],
    LINES: (n) => [0x1b, 0x64, n]
  },

  BARCODE: {
    HEIGHT: (h) => [0x1d, 0x68, h],
    WIDTH: (w) => [0x1d, 0x77, w],
    PRINT: (type, data) => {
      const cmd = [0x1d, 0x6b, type]
      return [...cmd, ...Buffer.from(data)]
    },
    TYPE: {
      UPC_A: 0x00,
      UPC_E: 0x01,
      EAN13: 0x02,
      EAN8: 0x03,
      CODE39: 0x04,
      ITF: 0x05,
      NW7: 0x06,
      CODE128: 0x49
    }
  },

  QRCODE: {
    SIZE: (s) => [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, s],
    ERROR: (l) => [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, l],
    PRINT: (data) => {
      const len = Buffer.byteLength(data) + 3
      return [0x1d, 0x28, 0x6b, len & 0xff, (len >> 8) & 0xff, 0x31, 0x50, 0x30, ...Buffer.from(data)]
    }
  }
}

class LabelPrinter {
  constructor(options = {}) {
    this.width = options.width || 50
    this.height = options.height || 30
    this.gap = options.gap || 2
    this.printerType = options.printerType || 'HPRT_N31BT'
    this.buffer = []
  }

  init() {
    this.buffer = []
    this.buffer.push(...ESC.INIT)
    return this
  }

  setAlignment(align) {
    switch (align) {
      case 'left':
      case 'lt':
        this.buffer.push(...ESC.ALIGN.LEFT)
        break
      case 'center':
      case 'ct':
        this.buffer.push(...ESC.ALIGN.CENTER)
        break
      case 'right':
      case 'rt':
        this.buffer.push(...ESC.ALIGN.RIGHT)
        break
    }
    return this
  }

  setFontStyle(style) {
    switch (style) {
      case 'normal':
        this.buffer.push(...ESC.FONT.NORMAL)
        break
      case 'bold':
        this.buffer.push(...ESC.FONT.BOLD)
        break
      case 'double_height':
        this.buffer.push(...ESC.FONT.DOUBLE_HEIGHT)
        break
      case 'double_width':
        this.buffer.push(...ESC.FONT.DOUBLE_WIDTH)
        break
      case 'double':
        this.buffer.push(...ESC.FONT.DOUBLE)
        break
    }
    return this
  }

  setFontSize(font = 'A') {
    this.buffer.push(...(font === 'B' ? ESC.FONT_SIZE.FONT_B : ESC.FONT_SIZE.FONT_A))
    return this
  }

  printText(text, options = {}) {
    const encoding = options.encoding || 'gbk'
    let textBuffer

    try {
      if (encoding === 'gbk') {
        textBuffer = this.toGBK(text)
      } else {
        textBuffer = Buffer.from(text, encoding)
      }
    } catch (e) {
      textBuffer = Buffer.from(text)
    }

    this.buffer.push(...textBuffer, ...ESC.LF)
    return this
  }

  printLine(text, options = {}) {
    this.setAlignment(options.align || 'left')
    if (options.bold) {
      this.buffer.push(...ESC.FONT.BOLD)
    }
    if (options.fontSize) {
      this.setFontSize(options.fontSize)
    }
    this.printText(text, options)
    this.buffer.push(...ESC.FONT.NORMAL)
    return this
  }

  printLines(lines, options = {}) {
    for (const line of lines) {
      if (typeof line === 'string') {
        this.printLine(line, options)
      } else {
        this.printLine(line.text, line)
      }
    }
    return this
  }

  feedPaper(lines = 3) {
    this.buffer.push(...ESC.FEED.LINES(lines))
    return this
  }

  cutPaper(partial = true) {
    if (this.printerType === 'HPRT_N31BT' || this.printerType === 'HPRT_N31') {
      this.feedPaper(4)
      this.buffer.push(...ESC.CUT.PARTIAL)
    } else {
      this.buffer.push(...(partial ? ESC.CUT.PARTIAL : ESC.CUT.FULL))
    }
    return this
  }

  printBarcode(data, options = {}) {
    const type = options.type || ESC.BARCODE.TYPE.CODE128
    const height = options.height || 60
    const width = options.width || 2

    this.buffer.push(...ESC.BARCODE.HEIGHT(height))
    this.buffer.push(...ESC.BARCODE.WIDTH(width))
    this.buffer.push(...ESC.BARCODE.PRINT(type, data))
    this.buffer.push(...ESC.LF)
    return this
  }

  printQRCode(data, options = {}) {
    const size = options.size || 6
    const errorLevel = options.errorLevel || 3

    this.buffer.push(...ESC.QRCODE.SIZE(size))
    this.buffer.push(...ESC.QRCODE.ERROR(errorLevel))
    this.buffer.push(...ESC.QRCODE.PRINT(data))
    return this
  }

  toGBK(str) {
    try {
      const iconv = require('iconv-lite')
      return iconv.encode(str, 'gbk')
    } catch (e) {
      return Buffer.from(str)
    }
  }

  generate() {
    return Buffer.from(this.buffer)
  }

  getData() {
    return new Uint8Array(this.buffer)
  }
}

function createLabelPrinter(options) {
  return new LabelPrinter(options)
}

function generateLabel(order, template, options = {}) {
  const printer = createLabelPrinter({
    width: template.width || 50,
    height: template.height || 30,
    printerType: options.printerType || 'HPRT_N31BT'
  })

  printer.init()

  const fields = template.fields || ['itemId', 'nickname', 'content', 'time', 'serial', 'round']
  const align = template.align || 'left'

  printer.setAlignment(align)

  for (const field of fields) {
    let label = ''
    let value = ''

    switch (field) {
      case 'itemId':
        label = '商品编号:'
        value = order.itemId || order.serial || '-'
        break
      case 'nickname':
        label = '买家:'
        value = order.nickname || '-'
        break
      case 'content':
        label = '扣号:'
        value = order.content || order.matchedContent || '-'
        break
      case 'time':
        label = '时间:'
        value = order.time || new Date().toLocaleTimeString('zh-CN', { hour12: false })
        break
      case 'serial':
        label = '序号:'
        value = `#${String(order.serial || order.id || '0001').padStart(4, '0')}`
        break
      case 'round':
        label = '批次:'
        value = String(order.round || '001').padStart(3, '0')
        break
      case 'shopName':
        label = '店铺:'
        value = order.shopName || '-'
        break
      default:
        label = `${field}:`
        value = order[field] || '-'
    }

    printer.printLine(`${label}${value}`, {
      bold: true,
      align: align
    })
  }

  printer.feedPaper(3)
  printer.cutPaper(true)

  return printer
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LabelPrinter,
    createLabelPrinter,
    generateLabel,
    ESC,
    ESC_POS: ESC
  }
}

// ES6 导出
export {
  LabelPrinter,
  createLabelPrinter,
  generateLabel,
  ESC,
  ESC as ESC_POS
}

// 也支持默认导出
export default {
  LabelPrinter,
  createLabelPrinter,
  generateLabel,
  ESC,
  ESC_POS: ESC
}
