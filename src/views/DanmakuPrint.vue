<template>
  <div class="danmaku-print">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">扣打打印</h1>
        <span class="page-subtitle">直播弹幕自动打单系统</span>
      </div>
      <div class="header-right">
        <el-button 
          :type="isRunning ? 'danger' : 'primary'" 
          size="large" 
          @click="toggleAutoPrint"
        >
          {{ isRunning ? '停止自动打单' : '开启自动打单' }}
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">直播店铺</span>
            <el-button type="primary" size="small" @click="showAddShopDialog = true">
              添加
            </el-button>
          </div>
          <div class="card-content">
            <el-select
              v-model="currentShopId"
              placeholder="请选择直播店铺"
              size="default"
              style="width: 100%;"
              @change="handleShopChange"
            >
              <el-option
                v-for="shop in shops"
                :key="shop.id"
                :label="shop.name"
                :value="shop.id"
              />
            </el-select>
          </div>
        </div>

        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">打印配置</span>
          </div>
          <div class="card-content">
            <div class="config-item">
              <span class="config-label">打印模板</span>
              <el-select
                v-model="currentTemplateId"
                placeholder="选择模板"
                size="default"
                style="flex: 1;"
              >
                <el-option
                  v-for="template in printTemplates"
                  :key="template.id"
                  :label="`${template.name} (${template.width}×${template.height}mm)`"
                  :value="template.id"
                />
              </el-select>
            </div>
            <div class="config-item">
              <span class="config-label">打印机</span>
              <el-select
                v-model="currentPrinterId"
                placeholder="选择打印机"
                size="default"
                style="flex: 1;"
              >
                <el-option
                  v-for="printer in printers"
                  :key="printer.id"
                  :label="printer.name"
                  :value="printer.id"
                />
              </el-select>
              <el-button type="primary" size="small" @click="handleTestPrint">
                测试打印
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="center-panel">
        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">扣数规则</span>
          </div>
          <div class="card-content">
            <div class="rule-buttons">
              <el-button
                v-for="rule in danmakuRules"
                :key="rule"
                :type="selectedRule === rule ? 'primary' : 'default'"
                size="small"
                @click="selectedRule = rule"
                class="rule-button"
              >
                {{ rule }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="card-header">
            <span class="card-title">高级设置</span>
          </div>
          <div class="card-content">
            <div class="advanced-config">
              <div class="config-row">
                <div class="config-group">
                  <el-checkbox v-model="advancedSettings.limitedRush">限量抢单</el-checkbox>
                  <el-input-number
                    v-if="advancedSettings.limitedRush"
                    v-model="advancedSettings.limitCount"
                    :min="1"
                    :max="10000"
                    size="small"
                    controls-position="right"
                    style="width: 100px; margin-left: 8px;"
                  />
                  <span v-if="advancedSettings.limitedRush" class="unit">个</span>
                </div>
                <div class="config-group">
                  <el-checkbox v-model="advancedSettings.singleMode">孤品模式</el-checkbox>
                </div>
              </div>
              <div class="config-row">
                <div class="config-group">
                  <el-checkbox v-model="advancedSettings.quickPass">快速过款</el-checkbox>
                </div>
                <div class="config-group">
                  <el-checkbox v-model="advancedSettings.antiSpam">防多打</el-checkbox>
                </div>
              </div>
              <div class="config-row">
                <div class="config-group">
                  <el-checkbox v-model="advancedSettings.fanPriority">灯牌优先</el-checkbox>
                </div>
                <div class="config-group">
                  <el-checkbox v-model="advancedSettings.mirrorPrint">镜像打印</el-checkbox>
                </div>
              </div>
            </div>

            <div class="round-info">
              <div class="round-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ currentRoundOrderCount }}</div>
                  <div class="stat-label">本轮扣数</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-value">{{ orders.length }}</div>
                  <div class="stat-label">总订单</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-value">{{ orders.filter(o => o.status === '已扣中').length }}</div>
                  <div class="stat-label">已扣中</div>
                </div>
              </div>
              <el-button type="primary" @click="startNextRound">
                下一轮
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="status-card" :class="isRunning ? 'status-active' : 'status-idle'">
          <div class="status-icon">
            {{ isRunning ? '📡' : '⏸️' }}
          </div>
          <div class="status-text">
            <div class="status-title">{{ isRunning ? '正在监听' : '已停止' }}</div>
            <div class="status-desc">{{ isRunning ? '弹幕实时监听中...' : '点击上方按钮开始' }}</div>
          </div>
          <div class="status-indicator" :class="{ active: isRunning }">
            <span class="indicator-dot"></span>
            {{ isRunning ? '运行中' : '停止' }}
          </div>
        </div>

        <div class="order-list-card">
          <div class="card-header">
            <span class="card-title">订单列表</span>
            <div class="card-actions">
              <el-button type="text" size="small" @click="handleClearOrders">清空</el-button>
            </div>
          </div>
          <div class="table-container">
            <el-table
              :data="orders"
              size="small"
              height="100%"
              style="width: 100%"
              :header-cell-style="{ background: '#f7f8fa', color: '#1d2129' }"
              stripe
            >
              <el-table-column prop="serial" label="序号" width="60" align="center" />
              <el-table-column prop="nickname" label="昵称" width="100" show-overflow-tooltip />
              <el-table-column prop="content" label="公屏内容" min-width="120" show-overflow-tooltip />
              <el-table-column prop="itemId" label="商品编号" width="90" show-overflow-tooltip />
              <el-table-column prop="round" label="批次号" width="70" align="center" />
              <el-table-column prop="time" label="时间" width="80" align="center" />
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === '已扣中' ? 'success' : 'info'" size="small" effect="light">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddShopDialog" title="添加直播店铺" width="480px" :close-on-click-modal="false">
      <el-form :model="newShop" label-width="90px">
        <el-form-item label="店铺名称">
          <el-input v-model="newShop.name" placeholder="请输入店铺名称" size="large" />
        </el-form-item>
        <el-form-item label="平台">
          <el-radio-group v-model="newShop.platform" size="large">
            <el-radio value="抖音">抖音</el-radio>
            <el-radio value="淘宝">淘宝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="直播间ID">
          <el-input v-model="newShop.roomId" placeholder="请输入直播间ID" size="large" />
        </el-form-item>
        <el-form-item label="账号类型">
          <el-radio-group v-model="newShop.accountType" size="large">
            <el-radio value="店铺号">店铺号</el-radio>
            <el-radio value="达人号">达人号</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddShopDialog = false" size="large">取消</el-button>
        <el-button type="primary" @click="handleAddShop" size="large">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'DanmakuPrint',
  data() {
    return {
      currentShopId: null,
      currentTemplateId: null,
      currentPrinterId: null,
      serialRule: '流水序号',
      selectedRule: '有任意数字都打',
      showAddShopDialog: false,
      newShop: {
        name: '',
        platform: '抖音',
        roomId: '',
        accountType: '店铺号'
      },
      danmakuRules: [
        '有任意数字都打',
        '只有纯数字才打',
        '只打纯数字1和2',
        '只打纯数字除了1和2',
        '只打3位字母+1位数字',
        '只打数字+尺码',
        '只打关键词',
        '只打数字+关键词',
        '打数字+包含关键词'
      ]
    }
  },
  computed: {
    ...mapState([
      'shops',
      'printTemplates',
      'printers',
      'orders',
      'advancedSettings',
      'isRunning'
    ]),
    ...mapGetters(['currentRoundOrderCount'])
  },
  watch: {
    shops: {
      handler(newShops) {
        if (newShops.length > 0 && !this.currentShopId) {
          this.currentShopId = newShops[0].id
        }
      },
      immediate: true
    },
    printTemplates: {
      handler(newTemplates) {
        if (newTemplates.length > 0 && !this.currentTemplateId) {
          this.currentTemplateId = newTemplates[0].id
        }
      },
      immediate: true
    },
    printers: {
      handler(newPrinters) {
        if (newPrinters.length > 0 && !this.currentPrinterId) {
          this.currentPrinterId = newPrinters[0].id
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.loadShops()
    this.loadPrintTemplates()
  },
  methods: {
    ...mapMutations([
      'setSelectedRule',
      'setSerialRule',
      'setAdvancedSettings',
      'setCurrentRound',
      'addOrder',
      'clearOrders'
    ]),
    ...mapActions([
      'loadShops',
      'loadPrintTemplates',
      'addShop',
      'testPrint',
      'startAutoPrint',
      'stopAutoPrint',
      'startNextRound'
    ]),
    handleShopChange(shopId) {
      const shop = this.shops.find(s => s.id === shopId)
      this.$store.commit('setCurrentShop', shop)
    },
    async handleAddShop() {
      if (!this.newShop.name) {
        this.$message.warning('请输入店铺名称')
        return
      }
      await this.addShop(this.newShop)
      this.showAddShopDialog = false
      this.newShop = {
        name: '',
        platform: '抖音',
        roomId: '',
        accountType: '店铺号'
      }
      this.$message.success('店铺添加成功')
    },
    async handleTestPrint() {
      try {
        this.$message.success('测试打印命令已发送（模拟）')
        console.log('🖨️ 测试打印')
      } catch (error) {
        this.$message.error('测试打印失败')
      }
    },
    async toggleAutoPrint() {
      if (!this.currentShopId) {
        this.$message.warning('请先选择直播店铺')
        return
      }
      if (this.isRunning) {
        await this.stopAutoPrint()
        this.$message.info('已停止监听')
      } else {
        await this.startAutoPrint()
        this.$message.success('已开始监听')
      }
    },
    handleClearOrders() {
      this.$confirm('确定要清空所有订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.clearOrders()
        this.$message.success('订单列表已清空')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danmaku-print {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f2f3f5;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #86909c;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-content {
  display: grid;
  grid-template-columns: 320px 1fr 380px;
  gap: 16px;
  padding: 16px;
  flex: 1;
  overflow: hidden;
}

.left-panel,
.center-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.panel-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e6eb;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f2f3f5;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.card-content {
  padding: 20px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  font-size: 14px;
  color: #4e5969;
  width: 72px;
  flex-shrink: 0;
}

.rule-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule-button {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.rule-button:hover {
  transform: translateY(-1px);
}

.advanced-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.config-row {
  display: flex;
  gap: 24px;
}

.config-group {
  flex: 1;
}

.unit {
  margin-left: 4px;
  color: #86909c;
  font-size: 14px;
}

.round-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
}

.round-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1677ff;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e6eb;
}

.status-card {
  background: linear-gradient(135deg, #fff 0%, #f7f8fa 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.status-active {
  background: linear-gradient(135deg, #e6f4ff 0%, #fff 100%);
  border-color: #1677ff;
}

.status-idle {
  background: linear-gradient(135deg, #f7f8fa 0%, #fff 100%);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f7f8fa;
  font-size: 40px;
}

.status-text {
  text-align: center;
}

.status-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.status-desc {
  font-size: 13px;
  color: #86909c;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: #86909c;
  background: #f2f3f5;
}

.status-indicator.active {
  color: #00b42a;
  background: #e8ffea;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c9cdd4;
}

.status-indicator.active .indicator-dot {
  background: #00b42a;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.order-list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-container {
  flex: 1;
  overflow: hidden;
  padding: 0 20px 20px;
}

@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 300px 1fr 360px;
    gap: 12px;
    padding: 12px;
  }
}
</style>
