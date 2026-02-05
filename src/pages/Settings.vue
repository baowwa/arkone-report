<template>
  <div class="settings-page">
    <PageHeader
      title="系统设置"
      subtitle="配置机构基础信息与报告展示规范。"
    />

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div class="panel-title">机构信息</div>
          <el-form label-position="top">
            <el-form-item label="机构名称">
              <el-input v-model="localOrg.name" />
            </el-form-item>
            <el-form-item label="机构地址">
              <el-input v-model="localOrg.address" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="localOrg.phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveOrg">保存</el-button>
              <el-button @click="resetOrg">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div class="panel-title">打印规范</div>
          <div class="print-rule">
            <div>页面规格: A4</div>
            <div>推荐边距: 12mm</div>
            <div>预览与打印一致性: 重点验证</div>
          </div>
        </el-card>

        <el-card>
          <div class="panel-title">字体与样式</div>
          <div class="print-rule">
            <div>主字体: IBM Plex Sans</div>
            <div>标题字体: Source Serif 4</div>
            <div>颜色规范: 深青 + 暖灰</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const localOrg = reactive({ ...store.orgInfo })

const saveOrg = () => {
  store.updateOrgInfo({ ...localOrg })
}

const resetOrg = () => {
  localOrg.name = store.orgInfo.name
  localOrg.address = store.orgInfo.address
  localOrg.phone = store.orgInfo.phone
}
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #0f172a;
}

.print-rule {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #475569;
  font-size: 13px;
}
</style>
