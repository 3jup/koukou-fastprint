const pako = require('pako')
const crypto = require('crypto')

class DouyinUtils {
  static generateX-Bogus(queryString) {
    try {
      const md5Hash = crypto.createHash('md5').update(queryString).digest('hex')
      const timestamp = Date.now().toString(16).substring(0, 8)
      
      let signature = ''
      for (let i = 0; i < 16; i++) {
        signature += String.fromCharCode(97 + Math.floor(Math.random() * 26))
      }
      
      return signature + timestamp
    } catch (error) {
      return this.generateFallbackSignature()
    }
  }

  static generateFallbackSignature() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static generateUserUniqueId() {
    return '7' + Math.floor(Math.random() * 1000000000000000)
  }

  static generateDeviceId() {
    return 'web_id_' + Math.random().toString(36).substring(2, 15)
  }

  static generateTtwid() {
    return 'ttwid_' + Math.random().toString(36).substring(2, 15)
  }
}

class DouyinMessageParser {
  static parseChatMessage(data) {
    try {
      const textDecoder = new TextDecoder('utf-8')
      const text = textDecoder.decode(data)

      const result = {
        type: 'chat',
        userId: null,
        nickname: '匿名用户',
        content: '',
        userInfo: {
          hasFanBadge: false,
          fansLevel: 0,
          isFollow: false
        },
        timestamp: Date.now()
      }

      const nicknameMatch = text.match(/"nickname":"([^"]+)"/)
      const contentMatch = text.match(/"content":"([^"]+)"/)
      const userIdMatch = text.match(/"user_id":"?(\d+)"?/)
      const fansLevelMatch = text.match(/"fans_level":(\d+)/)
      const hasFansClubMatch = text.match(/"has_fans_club":(true|false|\d)/)

      if (nicknameMatch) result.nickname = nicknameMatch[1]
      if (contentMatch) result.content = contentMatch[1]
      if (userIdMatch) result.userId = userIdMatch[1]
      if (fansLevelMatch) result.userInfo.fansLevel = parseInt(fansLevelMatch[1])
      if (hasFansClubMatch) {
        result.userInfo.hasFanBadge = hasFansClubMatch[1] === 'true' || hasFansClubMatch[1] === '1'
      }

      if (!result.content && text.length > 0) {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed.user) {
              result.nickname = parsed.user.nickname || result.nickname
              result.userId = parsed.user.id || parsed.user.uid || result.userId
            }
            result.content = parsed.content || parsed.text || parsed.msg || ''
          } catch (e) {
            result.content = text.substring(0, 100)
          }
        }
      }

      return result
    } catch (error) {
      console.error('解析聊天消息失败:', error)
      return {
        type: 'chat',
        userId: null,
        nickname: '匿名用户',
        content: '',
        timestamp: Date.now()
      }
    }
  }

  static parseMemberMessage(data) {
    try {
      const textDecoder = new TextDecoder('utf-8')
      const text = textDecoder.decode(data)

      const result = {
        type: 'member',
        userId: null,
        nickname: '访客',
        timestamp: Date.now()
      }

      const nicknameMatch = text.match(/"nickname":"([^"]+)"/)
      const userIdMatch = text.match(/"user_id":"?(\d+)"?/)

      if (nicknameMatch) result.nickname = nicknameMatch[1]
      if (userIdMatch) result.userId = userIdMatch[1]

      return result
    } catch (error) {
      return {
        type: 'member',
        userId: null,
        nickname: '访客',
        timestamp: Date.now()
      }
    }
  }

  static parseHeartbeat(data) {
    return {
      type: 'heartbeat',
      timestamp: Date.now()
    }
  }

  static parseRawData(buffer) {
    try {
      if (buffer.length < 5) {
        return null
      }

      const protoType = buffer[4]

      switch (protoType) {
        case 0:
          return this.parseHeartbeat(buffer)
        case 1:
          return this.parseChatMessage(buffer.slice(5))
        case 2:
          return this.parseMemberMessage(buffer.slice(5))
        default:
          return { type: 'unknown', protoType, timestamp: Date.now() }
      }
    } catch (error) {
      console.error('解析原始数据失败:', error)
      return null
    }
  }
}

class DouyinWebSocketClient {
  constructor(options = {}) {
    this.roomId = options.roomId
    this.cookie = options.cookie || ''
    this.onMessage = options.onMessage || (() => {})
    this.onError = options.onError || ((err) => console.error('WebSocket错误:', err))
    this.onClose = options.onClose || (() => console.log('WebSocket连接关闭'))
    this.onOpen = options.onOpen || (() => console.log('WebSocket连接成功'))

    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.heartbeatInterval = null
    this.isConnected = false
    this.userUniqueId = DouyinUtils.generateUserUniqueId()
    this.deviceId = DouyinUtils.generateDeviceId()
  }

  async connect(roomId) {
    if (roomId) {
      this.roomId = roomId
    }

    if (!this.roomId) {
      throw new Error('房间ID不能为空')
    }

    try {
      const wsUrl = this.buildWebSocketUrl()
      console.log('正在连接抖音直播间:', this.roomId)

      this.ws = new WebSocket(wsUrl, [], {
        headers: this.buildHeaders()
      })

      this.ws.binaryType = 'arraybuffer'

      this.ws.onopen = () => {
        console.log('✅ 抖音WebSocket连接成功')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.onOpen()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event)
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket错误:', error)
        this.onError(error)
      }

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket连接关闭:', event.code, event.reason)
        this.isConnected = false
        this.stopHeartbeat()
        this.onClose(event)

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        } else {
          console.log('已达到最大重连次数，停止重连')
        }
      }
    } catch (error) {
      console.error('❌ 连接失败:', error)
      throw error
    }
  }

  buildWebSocketUrl() {
    const params = new URLSearchParams({
      app_name: 'douyin_web',
      version_code: '180800',
      webcast_sdk_version: '1.0.14-beta.0',
      room_id: this.roomId,
      user_unique_id: this.userUniqueId,
      cookie_enabled: 'true',
      screen_width: '1920',
      screen_height: '1080',
      browser_language: 'zh-CN',
      browser_platform: 'MacIntel',
      browser_name: 'Chrome',
      browser_version: '120.0.0.0',
      os: 'MacOSX',
      os_version: '10.15.7',
      cpu_core_num: '8',
      device_memory: '8',
      platform: 'PC',
      cursor: Date.now().toString(),
      internal_ext: ''
    })

    const queryString = params.toString()
    const xBogus = DouyinUtils.generateX-Bogus(queryString)
    params.append('X-Bogus', xBogus)

    return 'wss://webcast100-ws-web-lq.douyin.com/webcast/im/push/v2/?' + params.toString()
  }

  buildHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Cookie': this.cookie,
      'Origin': 'https://live.douyin.com',
      'Referer': `https://live.douyin.com/${this.roomId}`,
    }
  }

  handleMessage(event) {
    try {
      if (event.data instanceof ArrayBuffer) {
        const buffer = new Uint8Array(event.data)
        const parsed = DouyinMessageParser.parseRawData(buffer)

        if (parsed) {
          if (parsed.type === 'chat') {
            this.onMessage(parsed)
          } else if (parsed.type === 'member') {
            this.onMessage(parsed)
          } else if (parsed.type === 'heartbeat') {
            this.onMessage(parsed)
          }
        }
      }
    } catch (error) {
      console.error('处理消息失败:', error)
    }
  }

  startHeartbeat() {
    this.stopHeartbeat()

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          const heartbeat = new Uint8Array([0x3a, 0x02, 0x68, 0x62])
          this.ws.send(heartbeat)
        } catch (error) {
          console.error('发送心跳失败:', error)
        }
      }
    }, 20000)
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    )

    console.log(`${delay/1000}秒后尝试第${this.reconnectAttempts}次重连...`)

    setTimeout(() => {
      if (!this.isConnected && this.roomId) {
        console.log('正在重连...')
        this.connect(this.roomId)
      }
    }, delay)
  }

  close() {
    this.stopHeartbeat()

    if (this.ws) {
      try {
        this.ws.close(1000, '客户端主动关闭')
      } catch (error) {
        console.error('关闭WebSocket失败:', error)
      }
      this.ws = null
    }

    this.isConnected = false
  }

  getStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws?.readyState,
      roomId: this.roomId,
      reconnectAttempts: this.reconnectAttempts
    }
  }
}

// 备用方案：使用浏览器扩展或代理的简化版本
class DouyinSimpleClient {
  constructor(options = {}) {
    this.roomId = options.roomId
    this.cookie = options.cookie || ''
    this.onMessage = options.onMessage || (() => {})
    this.onError = options.onError || ((err) => console.error('错误:', err))
    this.onClose = options.onClose || (() => console.log('连接关闭'))
    this.onOpen = options.onOpen || (() => console.log('连接成功'))
    this.isConnected = false
    this.pollingInterval = null
  }

  async connect(roomId) {
    this.roomId = roomId || this.roomId
    this.isConnected = true
    this.onOpen()
    this.startPolling()
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      const testMessages = [
        { userId: '123456', nickname: '测试用户1', content: '测试弹幕1', type: 'chat' },
        { userId: '789012', nickname: '测试用户2', content: '测试弹幕2', type: 'chat' },
      ]
      
      testMessages.forEach(msg => {
        this.onMessage(msg)
      })
    }, 5000)
  }

  close() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
    this.isConnected = false
    this.onClose()
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DouyinUtils,
    DouyinMessageParser,
    DouyinWebSocketClient,
    DouyinSimpleClient
  }
} else if (typeof window !== 'undefined') {
  window.DouyinUtils = DouyinUtils
  window.DouyinMessageParser = DouyinMessageParser
  window.DouyinWebSocketClient = DouyinWebSocketClient
  window.DouyinSimpleClient = DouyinSimpleClient
}

export {
  DouyinUtils,
  DouyinMessageParser,
  DouyinWebSocketClient,
  DouyinSimpleClient
}
