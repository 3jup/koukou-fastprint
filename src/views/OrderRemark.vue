<template>
  <div class="order-remark">
    <div class="remark-config">
      <div class="config-header">
        <span class="title">快递单备注设置</span>
      </div>
      <el-form :model="remarkConfig" label-width="100px">
        <el-form-item label="备注格式">
          <el-input
            v-model="remarkConfig.format"
            type="textarea"
            :rows="4"
            placeholder="如：商品编号:{itemId} | 买家:{nickname} | 扣号:{content}"
          />
        </el-form-item>
        <el-form-item label="可用变量">
          <div class="variables">
            <el-tag
              v-for="v in variables"
              :key="v.key"
              class="var-tag"
              @click="insertVariable(v.key)"
            >
              {{ v.key }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="remark-preview">
      <div class="preview-header">
        <span class="title">预览效果</span>
      </div>
      <div class="preview-content">
        <pre>{{ previewText }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderRemark',
  data() {
    return {
      remarkConfig: {
        format: '商品编号:{itemId} | 买家:{nickname} | 扣号:{content} | 序号:{serial}'
      },
      variables: [
        { key: '{itemId}', desc: '商品编号' },
        { key: '{nickname}', desc: '买家昵称' },
        { key: '{content}', desc: '扣号内容' },
        { key: '{serial}', desc: '流水序号' },
        { key: '{round}', desc: '批次号' },
        { key: '{time}', desc: '扣号时间' },
        { key: '{shopName}', desc: '店铺名称' }
      ],
      mockData: {
        itemId: 'Y0815',
        nickname: '张三',
        content: 'Y0815+已拍',
        serial: '0001',
        round: '001',
        time: '20:15:30',
        shopName: '测试店铺'
      }
    }
  },
  computed: {
    previewText() {
      let text = this.remarkConfig.format
      for (const [key, value] of Object.entries(this.mockData)) {
        text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
      }
      return text
    }
  },
  methods: {
    insertVariable(key) {
      this.remarkConfig.format += key
    },
    handleSave() {
      localStorage.setItem('remarkConfig', JSON.stringify(this.remarkConfig))
      this.$message.success('保存成功')
    },
    handleReset() {
      this.remarkConfig = {
        format: '商品编号:{itemId} | 买家:{nickname} | 扣号:{content} | 序号:{serial}'
      }
    }
  },
  mounted() {
    const saved = localStorage.getItem('remarkConfig')
    if (saved) {
      this.remarkConfig = JSON.parse(saved)
    }
  }
}
</script>

<style scoped>
.order-remark {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 15px;
  padding: 15px;
  height: 100%;
}

.order-remark > div {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e6eb;
}

.remark-config,
.remark-preview {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.config-header,
.preview-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f3f5;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2935;
}

.variables {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.var-tag {
  cursor: pointer;
}

.preview-content {
  flex: 1;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.preview-content pre {
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
