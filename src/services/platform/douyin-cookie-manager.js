class DouyinCookieManager {
  constructor() {
    this.cookie = ''
    this.cookieFile = 'douyin-cookie.json'
    this.loadCookie()
  }

  loadCookie() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.cookieFile)
        if (saved) {
          const data = JSON.parse(saved)
          this.cookie = data.cookie || ''
          console.log('已加载Cookie配置')
        }
      }
    } catch (error) {
      console.error('加载Cookie失败:', error)
    }
  }

  saveCookie(cookie) {
    try {
      this.cookie = cookie
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.cookieFile, JSON.stringify({
          cookie: cookie,
          updatedAt: Date.now()
        }))
        console.log('Cookie已保存')
      }
      return true
    } catch (error) {
      console.error('保存Cookie失败:', error)
      return false
    }
  }

  clearCookie() {
    try {
      this.cookie = ''
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.cookieFile)
      }
      return true
    } catch (error) {
      console.error('清除Cookie失败:', error)
      return false
    }
  }

  getCookie() {
    return this.cookie
  }

  validateCookie(cookie) {
    if (!cookie || cookie.trim() === '') {
      return { valid: false, reason: 'Cookie不能为空' }
    }

    const requiredKeys = ['sessionid', 'ttwid', 'passport_csrf_token']
    const missingKeys = requiredKeys.filter(key => !cookie.includes(key))

    if (missingKeys.length > 0) {
      return {
        valid: false,
        reason: `缺少必要的Cookie字段: ${missingKeys.join(', ')}`,
        requiredKeys: requiredKeys
      }
    }

    return { valid: true }
  }

  parseCookie(cookieString) {
    const cookies = {}
    if (!cookieString) return cookies

    cookieString.split(';').forEach(item => {
      const [key, value] = item.split('=').map(s => s.trim())
      if (key && value) {
        cookies[key] = value
      }
    })

    return cookies
  }

  extractCookieFromBrowser() {
    console.log('请手动从浏览器获取Cookie')
    return null
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DouyinCookieManager
  }
}
