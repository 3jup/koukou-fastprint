export default {
  spamCache: new Map(),

  matchRule(content, rule, settings = {}) {
    const trimmed = content.trim()

    switch (rule) {
      case '有任意数字都打':
        return /\d/.test(trimmed)

      case '只有纯数字才打':
        return /^\d+$/.test(trimmed)

      case '只打纯数字1和2':
        return /^(1|2)$/.test(trimmed)

      case '只打纯数字除了1和2':
        return /^\d+$/.test(trimmed) && !/^(1|2)$/.test(trimmed)

      case '只打3位字母+1位数字':
        return /^[a-zA-Z]{3}\d$/.test(trimmed)

      case '只打数字+尺码':
        return /^\d+[a-zA-Z]+$/.test(trimmed)

      case '只打关键词':
        return this.matchKeywords(trimmed, settings.keywords || [])

      case '只打数字+关键词':
        return /\d/.test(trimmed) && this.matchKeywords(trimmed, settings.keywords || [])

      case '打数字+包含关键词':
        return /\d/.test(trimmed) && this.containsKeywords(trimmed, settings.keywords || [])

      default:
        return false
    }
  },

  matchKeywords(content, keywords) {
    if (!keywords || keywords.length === 0) return false
    return keywords.some(keyword => content === keyword.trim())
  },

  containsKeywords(content, keywords) {
    if (!keywords || keywords.length === 0) return false
    return keywords.some(keyword => content.includes(keyword.trim()))
  },

  checkAntiSpam(userId, content, timeWindow = 5000) {
    const key = `${userId}_${content}`
    const now = Date.now()
    const lastTime = this.spamCache.get(key)

    if (lastTime && (now - lastTime) < timeWindow) {
      return true
    }

    this.spamCache.set(key, now)

    setTimeout(() => {
      this.spamCache.delete(key)
    }, timeWindow * 10)

    return false
  },

  checkFanPriority(userInfo, settings) {
    if (!settings || !settings.fanPriority) {
      return true
    }

    if (settings.onlyFan) {
      return userInfo && userInfo.hasFanBadge === true
    }

    return true
  },

  checkBlacklist(userId, blacklist) {
    if (!blacklist || blacklist.length === 0) return false
    return blacklist.some(item => item.userId === userId)
  },

  extractItemId(content) {
    const match = content.match(/\d+/)
    return match ? match[0] : content
  },

  extractSize(content, sizeSettings) {
    if (!sizeSettings || !sizeSettings.sizes) return null

    const sizes = sizeSettings.sizes.split('\n').map(s => s.trim().toUpperCase())
    const contentUpper = content.toUpperCase()

    for (const size of sizes) {
      if (contentUpper.includes(size)) {
        return size
      }
    }

    return null
  }
}
