// src/views/product/categoryBrand.vue
<template>
  <!-- 搜索表单 -->
  <div class="search-div">
    <el-form label-width="70px" size="small">
      <el-row>
        <el-col :span="12">
          <el-form-item label="品牌">
            <el-select
              v-model="queryDto.brandId"
              class="m-2"
              placeholder="选择品牌"
              size="small"
              style="width: 100%"
            >
              <el-option
                v-for="item in brandList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类">
            <el-cascader
              v-model="searchCategoryIdList"
              :props="categoryProps"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="display:flex">
        <el-button type="primary" size="small" @click="fetchData">
          搜索
        </el-button>
        <el-button size="small" @click="resetData">重置</el-button>
      </el-row>
    </el-form>
  </div>

  <!-- 工具栏 -->
  <div class="tools-div">
    <el-button type="success" size="small" @click="addShow">添 加</el-button>
  </div>

  <!-- 表格 -->
  <el-table :data="list" style="width: 100%">
    <el-table-column prop="categoryName" label="分类" />
    <el-table-column prop="brandName" label="品牌" />
    <el-table-column prop="logo" label="品牌图标" #default="scope">
      <img :src="scope.row.logo" width="50" />
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" />
    <el-table-column label="操作" align="center" width="200" #default="scope">
      <el-button type="primary" size="small" @click="editShow(scope.row)">
        修改
      </el-button>
      <el-button type="danger" size="small" @click="remove(scope.row.id)">
        删除
      </el-button>
    </el-table-column>
  </el-table>

  <!-- 分页组件 -->
  <el-pagination
    v-model:current-page="pageParams.page"
    v-model:page-size="pageParams.limit"
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next"
    :total="total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />

  <!-- 对话框 -->
  <el-dialog v-model="dialogVisible" title="添加或修改" width="30%">
    <el-form label-width="120px">
      <el-form-item label="品牌">
        <el-select
          v-model="categoryBrand.brandId"
          class="m-2"
          placeholder="选择品牌"
          size="small"
          style="width: 100%"
        >
          <el-option
            v-for="item in brandList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分类">
        <el-cascader
          v-model="categoryBrand.categoryId"
          :props="categoryProps"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveOrUpdate">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FindAllBrand } from '@/api/brand.js'
import { FindCategoryByParentId } from '@/api/category.js'
import { GetCategoryBrandPageList, SaveCategoryBrand, UpdateCategoryBrandById, DeleteCategoryBrandById } from '@/api/categoryBrand.js'
import { ElMessage, ElMessageBox } from 'element-plus'

// 数据模型定义
const brandList = ref([])
const list = ref([])
const total = ref(0)
const queryDto = ref({ brandId: '', categoryId: '' })
const searchCategoryIdList = ref([])
const pageParams = ref({
  page: 1,
  limit: 10
})

const dialogVisible = ref(false)
const categoryBrand = ref({})

// 分类属性配置
const props = {
  lazy: true,
  value: 'id',
  label: 'name',
  leaf: 'leaf',
  async lazyLoad(node, resolve) {
    if (typeof node.value == 'undefined') node.value = 0
    const { data } = await FindCategoryByParentId(node.value)
    data.forEach(item => {
      item.leaf = !item.hasChildren
    })
    resolve(data)
  }
}
const categoryProps = ref(props)

// 生命周期钩子
onMounted(() => {
  selectAllBrandList()
  fetchData()
})

// 方法定义
const selectAllBrandList = async () => {
  const { data } = await FindAllBrand()
  brandList.value = data
}

const fetchData = async () => {
  if (searchCategoryIdList.value.length == 3) {
    queryDto.value.categoryId = searchCategoryIdList.value[2]
  }
  const { data } = await GetCategoryBrandPageList(
    pageParams.value.page,
    pageParams.value.limit,
    queryDto.value
  )
  list.value = data.records
  total.value = data.total
}

const resetData = () => {
  queryDto.value = { brandId: '', categoryId: '' }
  searchCategoryIdList.value = []
  fetchData()
}

const handleSizeChange = size => {
  pageParams.value.limit = size
  fetchData()
}

const handleCurrentChange = number => {
  pageParams.value.page = number
  fetchData()
}

const addShow = () => {
  dialogVisible.value = true
  categoryBrand.value = {}
}

const editShow = row => {
  categoryBrand.value = row
  dialogVisible.value = true
}

const saveOrUpdate = async () => {
  if (!categoryBrand.value.brandId) {
    ElMessage.info('品牌信息必须选择')
    return
  }
  if (categoryBrand.value.categoryId.length != 3) {
    ElMessage.info('分类信息必须选择')
    return
  }
  categoryBrand.value.categoryId = categoryBrand.value.categoryId[2]
  
  if (!categoryBrand.value.id) {
    await SaveCategoryBrand(categoryBrand.value)
  } else {
    await UpdateCategoryBrandById(categoryBrand.value)
  }
  
  dialogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}

const remove = async id => {
  ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await DeleteCategoryBrandById(id)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}
</script>

<style scoped>
.search-div {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}
.tools-div {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}
</style>