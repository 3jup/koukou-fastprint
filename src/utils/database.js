const STORAGE_KEYS = {
  SHOPS: 'blitzorder_shops',
  TEMPLATES: 'blitzorder_templates',
  ORDERS: 'blitzorder_orders',
  BLACKLIST: 'blitzorder_blacklist',
  SETTINGS: 'blitzorder_settings'
}

const defaultTemplates = [
  {
    id: 1,
    name: '标准模板 50mm×30mm',
    width: 50,
    height: 30,
    content: { fields: ['商品编号', '买家昵称', '扣号内容', '扣号时间', '流水序号', '批次号'] },
    font: 'a',
    align: 'lt',
    size: 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 2,
    name: '小标签 40mm×25mm',
    width: 40,
    height: 25,
    content: { fields: ['商品编号', '买家昵称', '扣号内容'] },
    font: 'a',
    align: 'lt',
    size: 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

const db = {
  shops: {
    async toArray() {
      return loadFromStorage(STORAGE_KEYS.SHOPS, [])
    },
    async add(item) {
      const items = await this.toArray()
      const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1
      const newItem = { ...item, id }
      items.push(newItem)
      saveToStorage(STORAGE_KEYS.SHOPS, items)
      return id
    },
    async update(id, updates) {
      const items = await this.toArray()
      const index = items.findIndex(i => i.id === id)
      if (index !== -1) {
        items[index] = { ...items[index], ...updates }
        saveToStorage(STORAGE_KEYS.SHOPS, items)
      }
    },
    async delete(id) {
      const items = await this.toArray()
      const filtered = items.filter(i => i.id !== id)
      saveToStorage(STORAGE_KEYS.SHOPS, filtered)
    }
  },
  printTemplates: {
    async toArray() {
      const templates = loadFromStorage(STORAGE_KEYS.TEMPLATES, null)
      if (templates === null) {
        saveToStorage(STORAGE_KEYS.TEMPLATES, defaultTemplates)
        return defaultTemplates
      }
      return templates
    },
    async add(item) {
      const items = await this.toArray()
      const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1
      const newItem = { ...item, id }
      items.push(newItem)
      saveToStorage(STORAGE_KEYS.TEMPLATES, items)
      return id
    },
    async update(id, updates) {
      const items = await this.toArray()
      const index = items.findIndex(i => i.id === id)
      if (index !== -1) {
        items[index] = { ...items[index], ...updates }
        saveToStorage(STORAGE_KEYS.TEMPLATES, items)
      }
    },
    async delete(id) {
      const items = await this.toArray()
      const filtered = items.filter(i => i.id !== id)
      saveToStorage(STORAGE_KEYS.TEMPLATES, filtered)
    }
  },
  orders: {
    async toArray() {
      return loadFromStorage(STORAGE_KEYS.ORDERS, [])
    },
    async add(item) {
      const items = await this.toArray()
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
      const newItem = { ...item, id }
      items.unshift(newItem)
      const cutoffTime = Date.now() - 72 * 60 * 60 * 1000
      const filtered = items.filter(o => o.timestamp > cutoffTime)
      saveToStorage(STORAGE_KEYS.ORDERS, filtered)
      return id
    },
    async update(id, updates) {
      const items = await this.toArray()
      const index = items.findIndex(i => i.id === id)
      if (index !== -1) {
        items[index] = { ...items[index], ...updates }
        saveToStorage(STORAGE_KEYS.ORDERS, items)
      }
    },
    async delete(id) {
      const items = await this.toArray()
      const filtered = items.filter(i => i.id !== id)
      saveToStorage(STORAGE_KEYS.ORDERS, filtered)
    }
  },
  blacklist: {
    async toArray() {
      return loadFromStorage(STORAGE_KEYS.BLACKLIST, [])
    },
    async add(item) {
      const items = await this.toArray()
      const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1
      const newItem = { ...item, id }
      items.push(newItem)
      saveToStorage(STORAGE_KEYS.BLACKLIST, items)
      return id
    },
    async delete(id) {
      const items = await this.toArray()
      const filtered = items.filter(i => i.id !== id)
      saveToStorage(STORAGE_KEYS.BLACKLIST, filtered)
    }
  }
}

export default db
