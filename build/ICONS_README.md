# 应用图标说明

## 当前状态

✓ 已添加"扣扣快打"主题图标设计（SVG格式）

## 图标设计

### 设计理念
- **主题**: 直播打单、快速打印
- **颜色**: 渐变紫色系，配合打印机图标
- **元素**: 打印机、打印纸、"KK"标志、"快打"文字
- **风格**: 现代、简洁、专业

### 图标文件
- `icon.svg` - SVG矢量图标（已创建）

## 如何生成正式图标

### Mac (ICNS格式)

1. 打开 `icon.svg` 或使用设计工具（Figma、Photoshop等）导出512x512或1024x1024的PNG
2. 使用在线工具转换为ICNS格式
3. 保存为 `build/icon.icns`

推荐工具：
- https://cloudconvert.com/png-to-icns
- https://convertio.co/zh/png-icns/
- https://icon.kitchen/

### Windows (ICO格式)

1. 导出256x256的PNG
2. 使用在线工具转换为ICO格式
3. 保存为 `build/icon.ico`

推荐工具：
- https://cloudconvert.com/png-to-ico
- https://convertico.com/

### Linux (PNG格式)

1. 导出512x512的PNG
2. 保存为 `build/icon.png`

## 使用SVG图标预览

已创建 `icon.svg` 图标文件，可以：
1. 在浏览器中打开直接预览
2. 使用设计工具打开进行修改
3. 导出为PNG格式后转换为所需格式

## 图标设计建议

- ✓ 简洁明了，易于识别
- ✓ 符合直播/电商相关主题
- ✓ 保持清晰的层次和对比度
- ✓ 使用了渐变背景和现代设计
- ✓ 最小尺寸建议512x512像素

## 临时解决方案

在正式图标准备好之前，可以：
1. 使用已创建的SVG图标转换为所需格式
2. 使用免费的图标库（如Flaticon、IconFinder等）
3. 请设计师设计定制图标
4. 使用项目logo作为应用图标

## 注意事项

- 图标文件必须放在 `build/` 目录下
- 文件名必须与配置一致（icon.icns, icon.ico, icon.png）
- 打包时会自动检测并使用图标
- 建议使用高分辨率源图（1024x1024）以保证各尺寸下的清晰度
