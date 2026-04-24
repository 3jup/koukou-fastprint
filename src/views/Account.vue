<template>
  <div class="account">
    <div class="account-info">
      <div class="section-header">
        <span class="title">账户信息</span>
      </div>
      <el-form :model="account" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="account.username" disabled />
        </el-form-item>
        <el-form-item label="会员类型">
          <el-tag :type="account.isVip ? 'success' : 'info'">
            {{ account.isVip ? '专业版' : '试用版' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="到期时间">
          <span>{{ account.expireTime || '永久' }}</span>
        </el-form-item>
        <el-form-item label="使用店铺数">
          <span>{{ account.shopCount }} / {{ account.maxShops }}</span>
        </el-form-item>
      </el-form>
    </div>

    <div class="license-info">
      <div class="section-header">
        <span class="title">授权信息</span>
      </div>
      <el-table :data="licenses" border size="small">
        <el-table-column prop="platform" label="平台" />
        <el-table-column prop="shopName" label="店铺" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '有效' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="到期时间" />
      </el-table>
    </div>

    <div class="upgrade-section">
      <el-button type="primary" size="large" @click="handleUpgrade">
        升级专业版
      </el-button>
      <p class="upgrade-tip">
        专业版功能：无限店铺、优先客服支持、高级扣数规则等
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Account',
  data() {
    return {
      account: {
        username: '用户',
        isVip: false,
        expireTime: '',
        shopCount: 0,
        maxShops: 1
      },
      licenses: []
    }
  },
  methods: {
    handleUpgrade() {
      this.$message.info('请联系客服升级专业版')
    }
  }
}
</script>

<style scoped>
.account {
  padding: 15px;
  height: 100%;
  overflow-y: auto;
}

.account-info,
.license-info {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e6eb;
}

.section-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f3f5;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2935;
}

.upgrade-section {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e6eb;
}

.upgrade-tip {
  margin-top: 10px;
  color: #86909c;
  font-size: 13px;
}
</style>
