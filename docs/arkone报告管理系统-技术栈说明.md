# ArkOne 报告管理系统（技术栈说明）

版本: v0.1
日期: 2026-02-06
状态: Draft
负责人: Bao

## 1. 前端技术栈
1. 框架: Vue 3 + TypeScript
2. 构建: Vite
3. UI 组件库: Element Plus
4. 路由: Vue Router
5. 状态管理: Pinia
6. 样式: SCSS

## 2. 核心能力与组件
1. 模板渲染
- Mustache
- DOMPurify（防止不安全 HTML）

2. PDF 与打印
- html2pdf.js
- window.print

3. 条码/二维码
- JsBarcode
- qrcode

4. 时间处理
- dayjs

## 3. 目录结构说明（关键）
1. 页面
- 报告列表: src/pages/ReportsList.vue
- 报告详情: src/pages/ReportDetail.vue
- 模板列表: src/pages/TemplatesList.vue
- 模板编辑: src/pages/TemplateEditor.vue

2. 模板与标准数据
- 模板预设: src/data/templatePresets.ts
- 默认模板: src/data/defaultTemplate.ts
- 标准数据模型: src/data/defaultStandardData.ts
- 标准字段: src/data/standardFields.ts

3. 核心逻辑
- 模板渲染器: src/utils/templateRenderer.ts
- 模板数据准备: src/utils/template.ts
- 校验规则: src/utils/validate.ts
- 字段路径工具: src/utils/path.ts

## 4. 运行方式
1. 安装依赖: npm install
2. 本地开发: npm run dev
3. 构建打包: npm run build
