import { createStore } from 'vuex'

export default createStore({
  state: {
    shops: [],
    currentShop: null,
    printTemplates: [],
    currentTemplate: null,
    printers: [
      { id: 1, name: '汉印 N31BT (模拟)', model: 'N31BT', connectionType: 'USB' },
      { id: 2, name: '测试打印机', model: 'Test', connectionType: 'Virtual' }
    ],
    currentPrinter: null,
    rules: {
      selectedRule: '有任意数字都打',
      sizeSettings: {},
      keywordSettings: {
        keywords: []
      }
    },
    advancedSettings: {
      limitedRush: false,
      limitCount: 100,
      singleMode: false,
      quickPass: false,
      quickPassTime: 30,
      antiSpam: true,
      antiSpamTime: 5,
      fanPriority: false,
      onlyFan: false,
      runOrderReminder: false,
      mirrorPrint: false
    },
    serialRule: '流水序号',
    autoResetRule: false,
    orders: [],
    currentRound: 1,
    totalLimit: 100,
    autoPrint: false,
    isRunning: false
  },

  mutations: {
    setShops(state, shops) {
      state.shops = shops
    },
    setCurrentShop(state, shop) {
      state.currentShop = shop
    },
    setPrintTemplates(state, templates) {
      state.printTemplates = templates
    },
    setCurrentTemplate(state, template) {
      state.currentTemplate = template
    },
    addPrintTemplate(state, template) {
      state.printTemplates.push(template)
      // 保存到localStorage
      localStorage.setItem('blitzorder_templates', JSON.stringify(state.printTemplates))
    },
    removePrintTemplate(state, templateId) {
      state.printTemplates = state.printTemplates.filter(t => t.id !== templateId)
      localStorage.setItem('blitzorder_templates', JSON.stringify(state.printTemplates))
    },
    setPrinters(state, printers) {
      state.printers = printers
    },
    setCurrentPrinter(state, printer) {
      state.currentPrinter = printer
    },
    setSelectedRule(state, rule) {
      state.rules.selectedRule = rule
    },
    setSizeSettings(state, settings) {
      state.rules.sizeSettings = settings
    },
    setKeywordSettings(state, settings) {
      state.rules.keywordSettings = settings
    },
    setAdvancedSettings(state, settings) {
      state.advancedSettings = { ...state.advancedSettings, ...settings }
    },
    setSerialRule(state, rule) {
      state.serialRule = rule
    },
    setAutoResetRule(state, value) {
      state.autoResetRule = value
    },
    addOrder(state, order) {
      const orderWithId = {
        ...order,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        serial: state.orders.length + 1,
        round: state.currentRound
      }
      state.orders.unshift(orderWithId)
      const cutoffTime = Date.now() - 72 * 60 * 60 * 1000
      state.orders = state.orders.filter(order => order.timestamp > cutoffTime)
    },
    updateOrder(state, { id, updates }) {
      const index = state.orders.findIndex(order => order.id === id)
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...updates }
      }
    },
    clearOrders(state) {
      state.orders = []
    },
    setCurrentRound(state, round) {
      state.currentRound = round
    },
    setTotalLimit(state, limit) {
      state.totalLimit = limit
    },
    setAutoPrint(state, value) {
      state.autoPrint = value
    },
    setIsRunning(state, value) {
      state.isRunning = value
    }
  },

  actions: {
    async loadShops({ commit }) {
      const saved = localStorage.getItem('blitzorder_shops')
      const shops = saved ? JSON.parse(saved) : []
      commit('setShops', shops)
      if (shops.length > 0 && !this.state.currentShop) {
        commit('setCurrentShop', shops[0])
      }
    },
    async addShop({ commit, dispatch }, shop) {
      const currentShops = this.state.shops
      const newShop = {
        ...shop,
        id: currentShops.length > 0 ? Math.max(...currentShops.map(s => s.id)) + 1 : 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      const newShops = [...currentShops, newShop]
      localStorage.setItem('blitzorder_shops', JSON.stringify(newShops))
      commit('setShops', newShops)
      commit('setCurrentShop', newShop)
    },
    async updateShop({ dispatch }, { id, updates }) {
      const currentShops = this.state.shops
      const index = currentShops.findIndex(s => s.id === id)
      if (index !== -1) {
        currentShops[index] = {
          ...currentShops[index],
          ...updates,
          updatedAt: Date.now()
        }
        localStorage.setItem('blitzorder_shops', JSON.stringify(currentShops))
        await dispatch('loadShops')
      }
    },
    async deleteShop({ dispatch }, id) {
      const currentShops = this.state.shops.filter(s => s.id !== id)
      localStorage.setItem('blitzorder_shops', JSON.stringify(currentShops))
      await dispatch('loadShops')
    },
    async loadPrintTemplates({ commit }) {
      const saved = localStorage.getItem('blitzorder_templates')
      let templates = saved ? JSON.parse(saved) : null
      
      if (!templates || templates.length === 0) {
        templates = [
          {
            id: 1,
            name: '暴富猫标准模板',
            width: 50,
            height: 70,
            fields: [
              { key: 'shopName', content: '', fontSize: 18, fontFamily: 'default', bold: true, align: 'center' },
              { key: 'remark', content: '', fontSize: 16, fontFamily: 'default', bold: true, align: 'left' },
              { key: 'nickname', content: '', fontSize: 14, fontFamily: 'default', bold: false, align: 'left' },
              { key: 'orderId', content: '', fontSize: 14, fontFamily: 'default', bold: true, align: 'left' },
              { key: 'time', content: '', fontSize: 12, fontFamily: 'default', bold: false, align: 'left' },
              { key: 'vip', content: '', fontSize: 14, fontFamily: 'default', bold: true, align: 'center' }
            ],
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ]
      }
      
      commit('setPrintTemplates', templates)
      if (templates.length > 0 && !this.state.currentTemplate) {
        commit('setCurrentTemplate', templates[0])
      }
    },
    async testPrint({ state }) {
      const printService = await import('../services/printService')
      await printService.default.testPrint(state.currentPrinter)
    },
    async startAutoPrint({ commit, state, dispatch }) {
      commit('setAutoPrint', true)
      commit('setIsRunning', true)
      
      const danmakuService = await import('../services/danmakuService')
      await danmakuService.default.startListening(state.currentShop)
    },
    async stopAutoPrint({ commit }) {
      commit('setAutoPrint', false)
      commit('setIsRunning', false)
      
      const danmakuService = await import('../services/danmakuService')
      await danmakuService.default.stopListening()
    },
    startNextRound({ commit, state }) {
      commit('setCurrentRound', state.currentRound + 1)
    }
  },

  getters: {
    currentRoundOrderCount: (state) => {
      return state.orders.filter(order => order.round === state.currentRound).length
    }
  }
})
