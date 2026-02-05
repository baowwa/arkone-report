<template>
  <div class="help-page">
    <PageHeader
      title="帮助中心"
      subtitle="模板语法、接口约定与自测说明。"
    />

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div class="panel-title">模板语法（Mustache）</div>
          <div class="help-text">占位符写法示例：</div>
          <pre class="code" v-pre>{{patient.name}}
{{order.reportNo}}
{{#results}}
  {{itemName}}
{{/results}}</pre>
          <div class="help-text">支持循环列表与简单字段替换，适合标准化模板。</div>
        </el-card>

        <el-card>
          <div class="panel-title">自测与闭环</div>
          <div class="help-text">每次发布前建议完成以下检查：</div>
          <div class="help-list">
            <div>1. 原始数据可解析</div>
            <div>2. 字段映射无空值</div>
            <div>3. 预览与打印一致</div>
            <div>4. PDF 可下载且内容完整</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div class="panel-title">API 对接说明（后端）</div>
          <div class="help-text">建议后端提供以下接口：</div>
          <pre class="code">POST /api/reports/preview
POST /api/reports/pdf
GET  /api/templates
POST /api/templates
GET  /api/dictionary</pre>
          <div class="help-text">接口返回标准数据结构，前端只负责渲染与打印。</div>
        </el-card>

        <el-card>
          <div class="panel-title">标准数据结构</div>
          <pre class="code">{
  "patient": { "name": "", "gender": "", "age": "" },
  "order": { "reportNo": "", "orderNo": "" },
  "results": [ { "itemName": "", "value": "", "flag": "" } ],
  "source": { "labName": "", "system": "" },
  "org": { "name": "", "address": "" },
  "doctor": { "name": "" }
}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
</script>

<style scoped>
.help-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #0f172a;
}

.help-text {
  font-size: 13px;
  color: #475569;
  margin-bottom: 10px;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #334155;
}

.code {
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 10px;
  font-size: 12px;
  overflow: auto;
}
</style>
