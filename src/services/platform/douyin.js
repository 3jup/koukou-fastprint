const crypto = require('crypto')

class DouyinSignature {
  constructor() {
    this.roomId = null
    this.userUniqueId = null
    this.deviceInfo = this.generateDeviceInfo()
  }

  generateDeviceInfo() {
    return {
      os: 'Macintosh',
      os_version: 'MacOSX10.15.7',
      app_name: 'douyin_web',
      version_code: '180800',
      webcast_sdk_version: '1.0.14-beta.0',
      browser_language: 'zh-CN',
      browser_name: 'Chrome',
      browser_version: '120.0.0.0',
      browser_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  }

  generateUserUniqueId() {
    return '7' + Math.floor(Math.random() * 1000000000000000)
  }

  async generateXBogus(url) {
    try {
      const params = this.extractParamsFromUrl(url)
      const md5Hash = this.calculateMD5(JSON.stringify(params))

      const signature = md5Hash.substring(0, 16) +
                       this.roomId.toString(16).padStart(8, '0') +
                       Date.now().toString(16).substring(0, 8)

      return signature.toUpperCase()
    } catch (error) {
      console.error('生成X-Bogus失败:', error)
      return ''
    }
  }

  extractParamsFromUrl(url) {
    try {
      const urlObj = new URL(url)
      return {
        app_name: urlObj.searchParams.get('app_name') || 'douyin_web',
        version_code: urlObj.searchParams.get('version_code') || '180800',
        webcast_sdk_version: urlObj.searchParams.get('webcast_sdk_version') || '1.0.14-beta.0',
        room_id: urlObj.searchParams.get('room_id'),
        user_unique_id: urlObj.searchParams.get('user_unique_id')
      }
    } catch (error) {
      console.error('解析URL参数失败:', error)
      return {}
    }
  }

  calculateMD5(text) {
    return crypto.createHash('md5').update(text).digest('hex')
  }

  generateacSignature(params) {
    try {
      const sortedKeys = Object.keys(params).sort()
      const paramString = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
      const signature = crypto
        .createHmac('sha256', '加密密钥')
        .update(paramString)
        .digest('hex')
      return signature
    } catch (error) {
      console.error('生成ac_signature失败:', error)
      return ''
    }
  }

  buildWebSocketUrl(roomId) {
    this.roomId = roomId
    this.userUniqueId = this.generateUserUniqueId()

    const baseUrl = 'wss://webcast100-ws-web-lq.douyin.com/webcast/im/push/v2/'
    const params = new URLSearchParams({
      app_name: 'douyin_web',
      version_code: '180800',
      webcast_sdk_version: '1.0.14-beta.0',
      room_id: roomId,
      user_unique_id: this.userUniqueId,
      cookie_enabled: 'true',
      screen_width: '1920',
      screen_height: '1080',
      browser_language: 'zh-CN',
      browser_platform: 'MacIntel',
      browser_name: 'Chrome',
      browser_version: '120.0.0.0',
      browser_user_agent: this.deviceInfo.browser_user_agent,
      os: 'MacOSX',
      os_version: '10.15.7',
      cpu_core_num: '8',
      device_memory: '8',
      platform: 'PC',
      downlink: '10',
      effective_type: 'unknown',
      connection_rtt: '0',
      websocket_error: 'true',
      cursor: Date.now().toString()
    })

    return baseUrl + '?' + params.toString()
  }
}

class DouyinDanmakuParser {
  constructor() {
    this.messageTypes = {
      0: 'Heartbeat',
      1: 'Chat',
      2: 'Member',
      3: 'Gift',
      4: 'Like',
      5: 'Social',
      6: 'RoomUserSeq',
      7: 'SubScribe',
      8: 'InterAction',
      9: 'Battle',
      10: 'Error',
      11: 'Danger',
      12: 'Control',
      13: 'Auth',
      14: 'Subscribe',
      15: 'IncomeAgent'
    }
  }

  parseMessage(buffer) {
    try {
      if (!buffer || buffer.length < 10) {
        return null
      }

      const protoType = this.readProtoType(buffer)

      if (protoType === 0) {
        return this.parseHeartbeat(buffer)
      } else if (protoType === 1) {
        return this.parseChatMessage(buffer)
      } else if (protoType === 2) {
        return this.parseMemberMessage(buffer)
      } else if (protoType === 3) {
        return this.parseGiftMessage(buffer)
      }

      return this.parseGenericMessage(buffer)
    } catch (error) {
      console.error('解析消息失败:', error)
      return null
    }
  }

  readProtoType(buffer) {
    try {
      if (buffer.length >= 5) {
        return buffer[4] || 0
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  parseHeartbeat(buffer) {
    try {
      const textDecoder = new TextDecoder('utf-8')
      const text = textDecoder.decode(buffer.slice(5))

      const data = {
        type: 'heartbeat',
        content: text,
        timestamp: Date.now()
      }

      if (text.includes('room_id')) {
        const match = text.match(/room_id["\s:]+(\d+)/)
        if (match) {
          data.roomId = match[1]
        }
      }

      return data
    } catch (error) {
      return { type: 'heartbeat', timestamp: Date.now() }
    }
  }

  parseChatMessage(buffer) {
    try {
      const textDecoder = new TextDecoder('utf-8')
      const text = textDecoder.decode(buffer.slice(5))

      const data = {
        type: 'chat',
        timestamp: Date.now()
      }

      const patterns = {
        userId: /user_id["\s:]+"?(\d+)"?/,
        nickname: /nickname["\s:]+"([^"]+)"/,
        content: /content["\s:]+"([^"]+)"/,
        fansLevel: /fans_level["\s:]+(\d+)/,
        hasFansClub: /has_fans_club["\s:]+(true|false|\d)/,
        isFollow: /is_follow["\s:]+(true|false|\d)/,
        badge: /badge.*?\{[^}]*level["\s:]+(\d+)[^}]*\}/
      }

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern)
        if (match) {
          if (key === 'hasFansClub' || key === 'isFollow') {
            data[key] = match[1] === 'true' || match[1] === '1'
          } else if (['fansLevel', 'userId'].includes(key)) {
            data[key] = parseInt(match[1])
          } else {
            data[key] = match[1]
          }
        }
      }

      if (!data.nickname && !data.content) {
        const jsonMatch = text.match(/\{.*\}/s)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            data.userId = parsed.user?.id || parsed.userId
            data.nickname = parsed.user?.nickname || parsed.nickname
            data.content = parsed.content || parsed.text || parsed.msg
            data.hasFanBadge = parsed.user?.fansClubStatus === 1
          } catch (e) {
            data.content = text.substring(0, 200)
          }
        }
      }

      return data
    } catch (error) {
      console.error('解析聊天消息失败:', error)
      return { type: 'chat', error: error.message, timestamp: Date.now() }
    }
  }

  parseMemberMessage(buffer) {
    try {
      const textDecoder = new TextDecoder('utf-8')
      const text = textDecoder.decode(buffer.slice(5))

      const data = {
        type: 'member',
        timestamp: Date.now()
      }

      const patterns = {
        userId: /user_id["\s:]+"?(\d+)"?/,
        nickname: /nickname["\s:]+"([^"]+)"/
      }

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern)
        if (match) {
          data[key] = key === 'userId' ? parseInt(match[1]) : match[1]
        }
      }

      return data
    } catch (error) {
      return { type: 'member', timestamp: Date.now() }
    }
  }

  parseGiftMessage(buffer) {
    try {
      const textDecoder = new TextDecoder('utf-8')
      const text = textDecoder.decode(buffer.slice(5))

      const data = {
        type: 'gift',
        timestamp: Date.now()
      }

      const patterns = {
        userId: /user_id["\s:]+"?(\d+)"?/,
        nickname: /nickname["\s:]+"([^"]+)"/,
        giftName: /gift_name["\s:]+"([^"]+)"/,
        giftCount: /gift_count["\s:]+(\d+)/
      }

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern)
        if (match) {
          if (key === 'giftCount') {
            data[key] = parseInt(match[1])
          } else if (key === 'userId') {
            data[key] = parseInt(match[1])
          } else {
            data[key] = match[1]
          }
        }
      }

      return data
    } catch (error) {
      return { type: 'gift', timestamp: Date.now() }
    }
  }

  parseGenericMessage(buffer) {
    try {
      const textDecoder = new TextDecoder('utf-8')
      const text = textDecoder.decode(buffer.slice(5))

      return {
        type: 'unknown',
        raw: text.substring(0, 500),
        timestamp: Date.now()
      }
    } catch (error) {
      return { type: 'unknown', timestamp: Date.now() }
    }
  }

  getMessageTypeName(protoType) {
    return this.messageTypes[protoType] || 'Unknown'
  }
}

class DouyinWebSocket {
  constructor(options = {}) {
    this.roomId = options.roomId
    this.onMessage = options.onMessage || (() => {})
    this.onError = options.onError || ((err) => console.error('WebSocket错误:', err))
    this.onClose = options.onClose || (() => console.log('WebSocket连接关闭'))
    this.onOpen = options.onOpen || (() => console.log('WebSocket连接成功'))

    this.ws = null
    this.signature = new DouyinSignature()
    this.parser = new DouyinDanmakuParser()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 1000
    this.heartbeatInterval = null
    this.isConnected = false
    this.url = null
  }

  async connect(roomId) {
    if (roomId) {
      this.roomId = roomId
    }

    if (!this.roomId) {
      throw new Error('房间ID不能为空')
    }

    try {
      this.url = this.signature.buildWebSocketUrl(this.roomId)

      console.log('正在连接抖音直播间:', this.roomId)
      console.log('WebSocket URL:', this.url.substring(0, 100) + '...')

      this.ws = new WebSocket(this.url)

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

  handleMessage(event) {
    try {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data)
        this.onMessage({
          type: 'control',
          data: data,
          timestamp: Date.now()
        })
      } else if (event.data instanceof ArrayBuffer) {
        const buffer = new Uint8Array(event.data)
        const parsed = this.parser.parseMessage(buffer)

        if (parsed) {
          if (parsed.type === 'chat') {
            this.onMessage({
              type: 'chat',
              userId: parsed.userId?.toString(),
              nickname: parsed.nickname || '匿名用户',
              content: parsed.content || '',
              userInfo: {
                hasFanBadge: parsed.hasFanBadge || false,
                fansLevel: parsed.fansLevel || 0,
                isFollow: parsed.isFollow || false
              },
              timestamp: parsed.timestamp || Date.now()
            })
          } else if (parsed.type === 'member') {
            this.onMessage({
              type: 'member',
              userId: parsed.userId?.toString(),
              nickname: parsed.nickname || '访客',
              timestamp: parsed.timestamp || Date.now()
            })
          } else if (parsed.type === 'heartbeat') {
            this.onMessage({
              type: 'heartbeat',
              timestamp: parsed.timestamp || Date.now()
            })
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
          const heartbeat = {
            type: 'heartbeat',
            timestamp: Date.now()
          }
          this.ws.send(JSON.stringify(heartbeat))
        } catch (error) {
          console.error('发送心跳失败:', error)
        }
      }
    }, 30000)
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

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        if (typeof data === 'object') {
          this.ws.send(JSON.stringify(data))
        } else {
          this.ws.send(data)
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        throw error
      }
    } else {
      throw new Error('WebSocket未连接')
    }
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
    this.roomId = null
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DouyinSignature,
    DouyinDanmakuParser,
    DouyinWebSocket
  }
}
