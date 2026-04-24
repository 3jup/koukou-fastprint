const http = require('http')
const https = require('https')
const crypto = require('crypto')
const { URL } = require('url')

class DouyinProxyService {
  constructor(port = 3001) {
    this.port = port
    this.server = null
    this.roomConnections = new Map()
  }

  start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res)
    })

    this.server.listen(this.port, () => {
      console.log(`🚀 抖音代理服务已启动: http://localhost:${this.port}`)
      console.log(`📡 可通过 http://localhost:${this.port}/api/room/{roomId}/connect 连接直播间`)
    })
  }

  handleRequest(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`)

    if (parsedUrl.pathname.startsWith('/api/')) {
      this.handleApiRequest(req, res, parsedUrl)
    } else if (parsedUrl.pathname.startsWith('/ws/')) {
      this.handleWebSocketRequest(req, res, parsedUrl)
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(JSON.stringify({
        status: 'ok',
        service: '抖音直播代理服务',
        version: '1.0.0',
        endpoints: {
          connect: 'GET /api/room/:roomId/connect',
          status: 'GET /api/room/:roomId/status',
          disconnect: 'POST /api/room/:roomId/disconnect',
          websocket: 'WS /ws/room/:roomId'
        }
      }))
    }
  }

  handleApiRequest(req, res, parsedUrl) {
    const pathParts = parsedUrl.pathname.split('/').filter(p => p)

    if (pathParts[1] === 'room' && pathParts[3] === 'connect') {
      const roomId = pathParts[2]
      this.handleConnect(req, res, roomId)
    } else if (pathParts[1] === 'room' && pathParts[3] === 'status') {
      const roomId = pathParts[2]
      this.handleStatus(req, res, roomId)
    } else if (pathParts[1] === 'room' && pathParts[3] === 'disconnect') {
      const roomId = pathParts[2]
      this.handleDisconnect(req, res, roomId)
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'API不存在' }))
    }
  }

  handleConnect(req, res, roomId) {
    if (!roomId) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: '房间ID不能为空' }))
      return
    }

    try {
      const wsUrl = this.generateWebSocketUrl(roomId)

      const connectionInfo = {
        roomId: roomId,
        wsUrl: wsUrl,
        connectedAt: Date.now(),
        clientIp: req.socket.remoteAddress
      }

      this.roomConnections.set(roomId, connectionInfo)

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(JSON.stringify({
        success: true,
        roomId: roomId,
        wsUrl: wsUrl,
        message: 'WebSocket连接信息已生成，请使用WebSocket连接'
      }))
    } catch (error) {
      console.error('生成连接信息失败:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: '生成连接信息失败', details: error.message }))
    }
  }

  handleStatus(req, res, roomId) {
    const connection = this.roomConnections.get(roomId)

    if (!connection) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        connected: false,
        roomId: roomId
      }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      connected: true,
      roomId: roomId,
      connectedAt: connection.connectedAt,
      uptime: Date.now() - connection.connectedAt
    }))
  }

  handleDisconnect(req, res, roomId) {
    const connection = this.roomConnections.get(roomId)

    if (connection) {
      this.roomConnections.delete(roomId)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        success: true,
        roomId: roomId,
        message: '连接已断开'
      }))
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        success: false,
        roomId: roomId,
        message: '连接不存在或已断开'
      }))
    }
  }

  handleWebSocketRequest(req, res, parsedUrl) {
    res.writeHead(501, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      error: 'WebSocket升级暂未实现，请使用生成的wsUrl自行连接'
    }))
  }

  generateWebSocketUrl(roomId) {
    const userUniqueId = '7' + Math.floor(Math.random() * 1000000000000000)

    const params = new URLSearchParams({
      app_name: 'douyin_web',
      version_code: '180800',
      webcast_sdk_version: '1.0.14-beta.0',
      room_id: roomId,
      user_unique_id: userUniqueId,
      cookie_enabled: 'true',
      screen_width: '1920',
      screen_height: '1080',
      browser_language: 'zh-CN',
      browser_platform: 'MacIntel',
      browser_name: 'Chrome',
      browser_version: '120.0.0.0',
      browser_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

    return 'wss://webcast100-ws-web-lq.douyin.com/webcast/im/push/v2/?' + params.toString()
  }

  stop() {
    if (this.server) {
      this.server.close()
      this.server = null
      console.log('抖音代理服务已停止')
    }
  }
}

if (require.main === module) {
  const service = new DouyinProxyService(3001)
  service.start()

  process.on('SIGINT', () => {
    console.log('\n正在停止服务...')
    service.stop()
    process.exit(0)
  })
}

module.exports = DouyinProxyService
