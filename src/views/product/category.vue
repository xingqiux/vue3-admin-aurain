<!-- src/views/product/category.vue -->
<template>
    <div class="tools-div">
      <el-button type="success" size="small" @click="exportData">导出</el-button>
      <el-button type="primary" size="small" @click="importData">导入</el-button>
    </div>
  
    <el-table
      :data="list"
      style="width: 100%"
      row-key="id"
      border
      lazy
      :load="fetchData"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="imageUrl" label="图标" #default="scope">
        <img :src="scope.row.imageUrl" width="50" />
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" />
      <el-table-column prop="status" label="状态" #default="scope">
        {{ scope.row.status == 1 ? '正常' : '停用' }}
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
    </el-table>
  
    <el-dialog v-model="dialogImportVisible" title="导入" width="30%">
      <el-form label-width="120px">
        <el-form-item label="分类文件">
          <el-upload
            class="upload-demo"
            action="http://localhost:8501/admin/product/category/importData"
            :on-success="onUploadSuccess"
            :headers="headers"
          >
            <el-button type="primary">上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { FindCategoryByParentId, ExportCategoryData } from '@/api/category.js'
  import { useApp } from '@/pinia/modules/app'
  import { ElMessage } from 'element-plus'
  
  const list = ref([])
  const dialogImportVisible = ref(false)
  const headers = {
    token: useApp().authorization.token
  }
  
  onMounted(async () => {
    const { data } = await FindCategoryByParentId(0)
    list.value = data
  })
  
  const fetchData = async (row, treeNode, resolve) => {
    const { data } = await FindCategoryByParentId(row.id)
    resolve(data)
  }
  
  const exportData = () => {
    ExportCategoryData().then(res => {
      const blob = new Blob([res])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = '分类数据.xlsx'
      link.click()
    })
  }
  
  const importData = () => {
    dialogImportVisible.value = true
  }
  
  const onUploadSuccess = async (response, file) => {
    ElMessage.success('操作成功')
    dialogImportVisible.value = false
    const { data } = await FindCategoryByParentId(0)
    list.value = data
  }
  </script>
  
  <style scoped>
  .tools-div {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ebeef5;
    border-radius: 3px;
    background-color: #fff;
  }
  </style>
  