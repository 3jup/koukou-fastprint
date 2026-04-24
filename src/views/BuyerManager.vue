<template>
  <div class="buyer-manager">
    <div class="blacklist-section">
      <div class="section-header">
        <span class="title">黑名单管理</span>
        <el-button type="primary" size="small" @click="showAddBlacklist = true">
          添加黑名单
        </el-button>
      </div>
      <el-table :data="blacklist" border size="small">
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="reason" label="原因" />
        <el-table-column prop="createdAt" label="添加时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleRemove(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="buyer-history">
      <div class="section-header">
        <span class="title">买家记录</span>
        <el-button size="small" @click="handleClearHistory">清空记录</el-button>
      </div>
      <el-table :data="buyerHistory" border size="small">
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="orderCount" label="下单次数" width="100" />
        <el-table-column prop="lastOrderTime" label="最后下单" width="180">
          <template #default="{ row }">
            {{ formatTime(row.lastOrderTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleAddToBlacklist(row)">
              加入黑名单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showAddBlacklist" title="添加黑名单" width="400px">
      <el-form :model="blacklistForm" label-width="80px">
        <el-form-item label="用户昵称">
          <el-input v-model="blacklistForm.nickname" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input
            v-model="blacklistForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拉黑原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddBlacklist = false">取消</el-button>
        <el-button type="primary" @click="handleAddBlacklist">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BuyerManager',
  data() {
    return {
      blacklist: [],
      buyerHistory: [],
      showAddBlacklist: false,
      blacklistForm: {
        nickname: '',
        reason: ''
      }
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleString('zh-CN')
    },
    loadBlacklist() {
      const saved = localStorage.getItem('blitzorder_blacklist')
      this.blacklist = saved ? JSON.parse(saved) : []
    },
    handleAddBlacklist() {
      if (!this.blacklistForm.nickname) {
        this.$message.warning('请输入用户昵称')
        return
      }
      const newItem = {
        id: Date.now(),
        userId: 'user_' + Date.now(),
        nickname: this.blacklistForm.nickname,
        reason: this.blacklistForm.reason,
        createdAt: Date.now()
      }
      this.blacklist.push(newItem)
      localStorage.setItem('blitzorder_blacklist', JSON.stringify(this.blacklist))
      this.showAddBlacklist = false
      this.blacklistForm = { nickname: '', reason: '' }
      this.$message.success('添加成功')
    },
    handleRemove(row) {
      this.blacklist = this.blacklist.filter(item => item.id !== row.id)
      localStorage.setItem('blitzorder_blacklist', JSON.stringify(this.blacklist))
      this.$message.success('已移除黑名单')
    },
    handleAddToBlacklist(row) {
      this.blacklistForm.nickname = row.nickname
      this.blacklistForm.reason = '多次跑单'
      this.showAddBlacklist = true
    },
    handleClearHistory() {
      this.buyerHistory = []
      this.$message.success('记录已清空')
    }
  },
  mounted() {
    this.loadBlacklist()
  }
}
</script>

<style scoped>
.buyer-manager {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  height: 100%;
}

.blacklist-section,
.buyer-history {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e6eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f3f5;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2935;
}
</style>
