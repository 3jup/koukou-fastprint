<template>
  <div class="print-template-editor">
    <!-- 左侧：模板列表 -->
    <div class="template-panel">
      <div class="panel-header">
        <div class="panel-icon">📋</div>
        <span class="panel-title">打印模板</span>
      </div>
      
      <div class="template-list">
        <div
          v-for="template in templates"
          :key="template.id"
          :class="['template-item', { active: currentTemplateId === template.id }]"
          @click="selectTemplate(template)"
        >
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-size">{{ template.width }}×{{ template.height }}mm</div>
          </div>
          <div class="template-actions">
            <el-button
              type="text"
              size="small"
              @click.stop="duplicateTemplate(template)"
              title="复制"
            >📄</el-button>
            <el-button
              type="text"
              size="small"
              @click.stop="deleteTemplate(template)"
              class="delete-btn"
            >🗑️</el-button>
          </div>
        </div>
      </div>

      <el-button class="add-template-btn" type="primary" @click="createNewTemplate">
        <span class="btn-icon">+</span>
        新建模板
      </el-button>
    </div>

    <!-- 中间和右侧区域 -->
    <template v-if="currentTemplate">
      <!-- 中间：编辑器 -->
      <div class="editor-panel">
        <div class="panel-header">
          <div class="header-left">
            <div class="panel-icon">✏️</div>
            <span class="panel-title">模板设计</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="testPrint">测试打印</el-button>
            <el-button type="primary" size="small" @click="saveTemplate">保存</el-button>
          </div>
        </div>

        <div class="editor-workspace">
          <!-- 顶部：快捷工具栏 -->
          <div class="editor-toolbar">
            <div class="toolbar-group">
              <el-input v-model="currentTemplate.name" placeholder="模板名称" size="small" style="width: 150px;" />
              <el-input-number
                v-model="currentTemplate.width"
                :min="20"
                :max="100"
                size="small"
                style="width: 100px;"
              />
              <span class="dim-label">mm ×</span>
              <el-input-number
                v-model="currentTemplate.height"
                :min="20"
                :max="100"
                size="small"
                style="width: 100px;"
              />
              <span class="dim-label">mm</span>
            </div>
            <div class="toolbar-tip">
              <span class="tip-text">💡 拖拽字段可调整顺序，点击字段可编辑</span>
            </div>
          </div>

          <!-- 中间：标签编辑区 -->
          <div class="editor-preview-area">
            <div 
              class="editor-label"
              :style="{ width: currentTemplate.width + 'mm', height: currentTemplate.height + 'mm' }"
              @dragover.prevent
              @drop.prevent="handleDropOnLabel"
            >
              <div class="label-content">
                <div
                  v-for="(field, index) in currentTemplate.fields"
                  :key="field.id || index"
                  :class="['label-field', { selected: selectedFieldIndex === index, dragging: draggingIndex === index }]"
                  draggable="true"
                  @dragstart="handleDragStart($event, index)"
                  @dragover="handleDragOver($event, index)"
                  @dragend="handleDragEnd"
                  @click="selectedFieldIndex = index"
                >
                  <div class="drag-handle" @mousedown.stop>⠿</div>
                  <div 
                    class="field-content" 
                    :style="getFieldStyle(field)"
                    contenteditable="true"
                    @blur="handleFieldBlur(index, $event)"
                    @input="handleFieldInput(index, $event)"
                  >
                    {{ getPreviewValue(field) }}
                  </div>
                  <div class="field-actions">
                    <div class="field-remove" @click.stop="removeField(index)" title="删除字段">×</div>
                  </div>
                </div>
              </div>
              <!-- 放置指示器 -->
              <div 
                v-if="dropTargetIndex !== null"
                class="drop-indicator"
                :style="{ top: getDropIndicatorPosition() + 'px' }"
              ></div>
            </div>
          </div>

          <!-- 属性编辑 -->
          <div class="field-properties" v-if="selectedFieldIndex !== null && currentTemplate.fields && currentTemplate.fields[selectedFieldIndex]">
            <div class="field-tools">
              <el-button-group>
                <el-button
                  :type="currentField.align === 'left' ? 'primary' : 'default'"
                  size="small"
                  @click="currentField.align = 'left'"
                >⬅️</el-button>
                <el-button
                  :type="currentField.align === 'center' ? 'primary' : 'default'"
                  size="small"
                  @click="currentField.align = 'center'"
                >⬌</el-button>
                <el-button
                  :type="currentField.align === 'right' ? 'primary' : 'default'"
                  size="small"
                  @click="currentField.align = 'right'"
                >➡️</el-button>
              </el-button-group>
              <el-divider direction="vertical" />
              <el-select v-model="currentField.fontFamily" size="small" style="width: 100px;" placeholder="字体">
                <el-option label="默认" value="default" />
                <el-option label="黑体" value="SimHei" />
                <el-option label="楷体" value="KaiTi" />
              </el-select>
              <el-input-number
                v-model="currentField.fontSize"
                :min="8"
                :max="32"
                size="small"
                style="width: 80px;"
              />
              <el-button
                :type="currentField.bold ? 'primary' : 'default'"
                size="small"
                @click="currentField.bold = !currentField.bold"
              >𝐁</el-button>
            </div>
          </div>

          <!-- 底部：可用字段 -->
          <div class="available-fields">
            <div class="fields-title">可用字段</div>
            <div class="fields-grid">
              <div
                v-for="field in availableFields"
                :key="field.key"
                class="available-field-item"
                draggable="true"
                @dragstart="handleFieldDragStart($event, field)"
                @dragend="handleFieldDragEnd"
                @click="addField(field)"
              >
                <span class="field-icon">{{ field.icon }}</span>
                <span class="field-label">{{ field.label }}</span>
                <span class="field-add">+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：预览 -->
      <div class="preview-panel">
        <div class="panel-header">
          <div class="header-left">
            <div class="panel-icon">👁️</div>
            <span class="panel-title">实时预览</span>
          </div>
          <div class="header-actions">
            <el-tag size="small" type="info">WYSWYG</el-tag>
          </div>
        </div>

        <div class="preview-container">
          <div class="preview-label"
               :style="{ width: currentTemplate.width + 'mm', height: currentTemplate.height + 'mm' }"
          >
            <div class="preview-content">
              <div
                v-for="(field, index) in currentTemplate.fields"
                :key="field.id || index"
                class="preview-field"
                :style="getFieldStyle(field)"
              >
                {{ getPreviewValue(field) }}
              </div>
            </div>
          </div>
        </div>

        <div class="preview-info">
          <div class="info-item">
            <span class="info-label">模板尺寸</span>
            <span class="info-value">{{ currentTemplate.width }}×{{ currentTemplate.height }}mm</span>
          </div>
          <div class="info-item">
            <span class="info-label">字段数量</span>
            <span class="info-value">{{ currentTemplate.fields ? currentTemplate.fields.length : 0 }}个</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 空状态提示 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">📝</div>
      <div class="empty-title">选择或创建一个模板</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PrintTemplateEditor',
  data() {
    return {
      currentTemplateId: null,
      currentTemplate: null,
      selectedFieldIndex: null,
      draggingIndex: null,
      dropTargetIndex: null,
      draggingField: null,
      availableFields: [
        { key: 'shopName', label: '店铺名称', icon: '🏪', defaultValue: '暴富猫手工穿戴甲' },
        { key: 'remark', label: '下单备注', icon: '📝', defaultValue: '下单备注：1' },
        { key: 'nickname', label: '买家昵称', icon: '👤', defaultValue: '小紫么么哒💖' },
        { key: 'orderId', label: '扣号内容', icon: '🔢', defaultValue: '扣号：1' },
        { key: 'time', label: '扣号时间', icon: '🕐', defaultValue: '2026-04-24 21:42:12' },
        { key: 'vip', label: 'VIP等级', icon: '👑', defaultValue: 'VIP：1' },
        { key: 'serial', label: '流水序号', icon: '📌', defaultValue: '序号：001' },
        { key: 'item', label: '商品信息', icon: '👗', defaultValue: '商品：Y0815' }
      ]
    }
  },
  computed: {
    ...mapState(['printTemplates']),
    templates() {
      return this.printTemplates
    },
    currentField() {
      if (this.selectedFieldIndex !== null && this.currentTemplate && this.currentTemplate.fields[this.selectedFieldIndex]) {
        return this.currentTemplate.fields[this.selectedFieldIndex]
      }
      return null
    }
  },
  methods: {
    getDefaultTemplate() {
      return {
        id: null,
        name: '标准模板',
        width: 50,
        height: 70,
        fields: [
          { id: 1, key: 'shopName', content: '', fontSize: 18, fontFamily: 'default', bold: true, align: 'center' },
          { id: 2, key: 'remark', content: '', fontSize: 16, fontFamily: 'default', bold: true, align: 'left' },
          { id: 3, key: 'nickname', content: '', fontSize: 14, fontFamily: 'default', bold: false, align: 'left' },
          { id: 4, key: 'orderId', content: '', fontSize: 14, fontFamily: 'default', bold: true, align: 'left' },
          { id: 5, key: 'time', content: '', fontSize: 12, fontFamily: 'default', bold: false, align: 'left' },
          { id: 6, key: 'vip', content: '', fontSize: 14, fontFamily: 'default', bold: true, align: 'center' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    },
    selectTemplate(template) {
      this.currentTemplateId = template.id
      this.currentTemplate = JSON.parse(JSON.stringify(template))
      this.selectedFieldIndex = null
    },
    createNewTemplate() {
      const newId = this.templates.length > 0 ? Math.max(...this.templates.map(t => t.id)) + 1 : 1
      const newTemplate = {
        ...this.getDefaultTemplate(),
        id: newId,
        name: `新模板${newId}`
      }
      this.$store.commit('addPrintTemplate', newTemplate)
      this.currentTemplateId = newId
      this.currentTemplate = JSON.parse(JSON.stringify(newTemplate))
      this.$message.success('已创建新模板')
    },
    duplicateTemplate(template) {
      const newId = this.templates.length > 0 ? Math.max(...this.templates.map(t => t.id)) + 1 : 1
      const newTemplate = {
        ...JSON.parse(JSON.stringify(template)),
        id: newId,
        name: template.name + ' 副本',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.$store.commit('addPrintTemplate', newTemplate)
      this.$message.success('已复制模板')
    },
    deleteTemplate(template) {
      this.$confirm(`确定要删除模板"${template.name}"吗？`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.commit('removePrintTemplate', template.id)
        if (this.currentTemplateId === template.id) {
          this.currentTemplateId = this.templates.length > 0 ? this.templates[0].id : null
          this.currentTemplate = this.templates.length > 0 ? JSON.parse(JSON.stringify(this.templates[0])) : null
        }
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    addField(fieldInfo) {
      const newField = {
        id: Date.now(),
        key: fieldInfo.key,
        content: '',
        fontSize: 14,
        fontFamily: 'default',
        bold: false,
        align: 'left'
      }
      this.currentTemplate.fields.push(newField)
      this.selectedFieldIndex = this.currentTemplate.fields.length - 1
      this.$message.success('已添加字段')
    },
    removeField(index) {
      this.currentTemplate.fields.splice(index, 1)
      if (this.selectedFieldIndex === index) {
        this.selectedFieldIndex = Math.max(0, index - 1)
      } else if (this.selectedFieldIndex > index) {
        this.selectedFieldIndex--
      }
    },
    // 拖拽相关方法
    handleDragStart(event, index) {
      this.draggingIndex = index
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', index.toString())
    },
    handleDragOver(event, index) {
      event.preventDefault()
      if (this.draggingIndex !== null && this.draggingIndex !== index) {
        this.dropTargetIndex = index
      }
    },
    handleDragEnd() {
      if (this.draggingIndex !== null && this.dropTargetIndex !== null && this.draggingIndex !== this.dropTargetIndex) {
        const [draggedItem] = this.currentTemplate.fields.splice(this.draggingIndex, 1)
        const insertIndex = this.draggingIndex < this.dropTargetIndex ? this.dropTargetIndex - 1 : this.dropTargetIndex
        this.currentTemplate.fields.splice(insertIndex, 0, draggedItem)
        this.selectedFieldIndex = insertIndex
      }
      this.draggingIndex = null
      this.dropTargetIndex = null
    },
    // 从可用字段拖拽
    handleFieldDragStart(event, field) {
      this.draggingField = field
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData('application/json', JSON.stringify(field))
    },
    handleFieldDragEnd() {
      this.draggingField = null
      this.dropTargetIndex = null
    },
    handleDropOnLabel(event) {
      if (this.draggingField) {
        this.addField(this.draggingField)
      }
    },
    getDropIndicatorPosition() {
      const container = document.querySelector('.label-content')
      if (!container || this.dropTargetIndex === null) return 0
      const fields = container.querySelectorAll('.label-field')
      if (fields[this.dropTargetIndex]) {
        return fields[this.dropTargetIndex].offsetTop - 4
      }
      return 0
    },
    // 字段编辑相关
    handleFieldBlur(index, event) {
      const text = event.target.innerText.trim()
      if (this.currentTemplate.fields[index]) {
        this.currentTemplate.fields[index].content = text
      }
    },
    handleFieldInput(index, event) {
      // 实时更新预览，但不保存到content，避免闪烁
    },
    getFieldStyle(field) {
      const style = {
        fontSize: (field.fontSize || 14) + 'px',
        textAlign: field.align || 'left',
        fontWeight: field.bold ? 'bold' : 'normal'
      }
      if (field.fontFamily && field.fontFamily !== 'default') {
        style.fontFamily = field.fontFamily
      }
      return style
    },
    getPreviewValue(field) {
      if (field.content) return field.content
      const info = this.availableFields.find(f => f.key === field.key)
      return info?.defaultValue || ''
    },
    saveTemplate() {
      if (!this.currentTemplate.name) {
        this.$message.warning('请输入模板名称')
        return
      }
      
      if (!this.currentTemplateId) {
        this.createNewTemplate()
        return
      }

      const index = this.templates.findIndex(t => t.id === this.currentTemplateId)
      if (index !== -1) {
        const updatedTemplate = {
          ...this.currentTemplate,
          updatedAt: Date.now()
        }
        this.templates[index] = updatedTemplate
        localStorage.setItem('blitzorder_templates', JSON.stringify(this.templates))
        this.$store.commit('setPrintTemplates', [...this.templates])
        this.$message.success('保存成功')
      }
    },
    testPrint() {
      this.$message.info('测试打印功能触发！连接打印机后可实际打印')
      console.log('模拟打印标签:', this.currentTemplate)
    }
  },
  created() {
    if (this.templates.length > 0) {
      this.currentTemplateId = this.templates[0].id
      this.currentTemplate = JSON.parse(JSON.stringify(this.templates[0]))
    }
  }
}
</script>

<style scoped>
.print-template-editor {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 16px;
  padding: 20px;
  height: 100%;
  background: #f5f7fa;
}

.template-panel,
.editor-panel,
.preview-panel {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-icon {
  font-size: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2935;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.template-list {
  flex: 1;
  overflow-y: auto;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  margin-bottom: 8px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.template-item:hover {
  background: #f0f7ff;
}

.template-item.active {
  background: #ecf5ff;
  border-color: #1677ff;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2935;
  margin-bottom: 4px;
}

.template-size {
  font-size: 12px;
  color: #86909c;
}

.template-actions {
  display: flex;
  gap: 4px;
  opacity: 0.7;
}

.template-actions:hover {
  opacity: 1;
}

.delete-btn {
  color: #f56c6c;
}

.add-template-btn {
  margin-top: 12px;
  width: 100%;
}

.btn-icon {
  font-size: 18px;
  margin-right: 6px;
}

.editor-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-tip {
  flex-shrink: 0;
}

.tip-text {
  font-size: 12px;
  color: #86909c;
}

.dim-label {
  color: #86909c;
  font-size: 12px;
}

.editor-preview-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 12px;
  padding: 40px;
  overflow-y: auto;
  position: relative;
}

.editor-label {
  background: #fff;
  border: 2px solid #1677ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4mm;
  position: relative;
}

.label-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.label-field {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: move;
  padding: 4px;
}

.label-field:hover {
  background: #f0f7ff;
}

.label-field.selected {
  background: #e6f4ff;
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

.label-field.dragging {
  opacity: 0.5;
  background: #d1e7ff;
}

.drag-handle {
  cursor: grab;
  color: #86909c;
  font-size: 14px;
  user-select: none;
  padding: 0 4px;
}

.drag-handle:active {
  cursor: grabbing;
}

.field-content {
  flex: 1;
  min-height: 20px;
  outline: none;
  word-break: break-word;
}

.field-content:focus {
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 0 0 1px #1677ff inset;
}

.field-actions {
  display: flex;
  gap: 4px;
}

.field-remove {
  padding: 2px 6px;
  cursor: pointer;
  color: #f56c6c;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 14px;
  border-radius: 4px;
}

.label-field:hover .field-remove {
  opacity: 1;
}

.field-remove:hover {
  background: #fef0f0;
}

.drop-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: #1677ff;
  border-radius: 2px;
  pointer-events: none;
  z-index: 10;
}

.field-properties {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.field-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.available-fields {
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}

.fields-title {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 12px;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.available-field-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.available-field-item:hover {
  background: #e6f4ff;
  color: #1677ff;
}

.available-field-item:active {
  cursor: grabbing;
}

.field-icon {
  font-size: 14px;
}

.field-label {
  flex: 1;
  font-size: 13px;
}

.field-add {
  color: #86909c;
  font-weight: bold;
}

.preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f9eb 0%, #e6fffa 100%);
  border-radius: 12px;
  padding: 40px;
}

.preview-label {
  background: #fff;
  border: 1px solid #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 4mm;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-field {
  line-height: 1.4;
  word-break: break-word;
}

.preview-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-size: 13px;
  color: #86909c;
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: #1d2935;
}

.empty-state {
  grid-column: 2 / 4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  color: #86909c;
}
</style>
