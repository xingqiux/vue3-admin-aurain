
  <!-- src/views/product/brand.vue -->
  <template>
    <div class="tools-div">
      <el-button type="success" size="small" @click="addShow">添 加</el-button>
    </div>
  
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="name" label="品牌名称" />
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
  
    <el-pagination
      v-model:current-page="pageParams.page"
      v-model:page-size="pageParams.limit"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  
    <el-dialog v-model="dialogVisible" title="添加或修改" width="30%">
      <el-form label-width="120px">
        <el-form-item label="品牌名称">
          <el-input v-model="brand.name"/>
        </el-form-item>
        <el-form-item label="品牌图标">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8501/admin/system/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :headers="headers"
          >
            <img v-if="brand.logo" :src="brand.logo" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
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
  import { GetBrandPageList, SaveBrand, UpdateBrandById, DeleteBrandById } from '@/api/brand.js'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useApp } from '@/pinia/modules/app'
  
  const list = ref([])
  const total = ref(0)
  const pageParams = ref({
    page: 1,
    limit: 10
  })
  const dialogVisible = ref(false)
  const brand = ref({})
  const headers = {
    token: useApp().authorization.token
  }
  
  onMounted(() => {
    fetchData()
  })
  
  const fetchData = async () => {
    const { data } = await GetBrandPageList(pageParams.value.page, pageParams.value.limit)
    list.value = data.records
    total.value = data.total
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
    brand.value = {}
    dialogVisible.value = true
  }
  
  const editShow = row => {
    brand.value = row
    dialogVisible.value = true
  }
  
  const handleAvatarSuccess = response => {
    brand.value.logo = response.data
  }
  
  const saveOrUpdate = () => {
    if (!brand.value.id) {
      saveData()
    } else {
      updateData()
    }
  }
  
  const saveData = async () => {
    await SaveBrand(brand.value)
    dialogVisible.value = false
    ElMessage.success('操作成功')
    fetchData()
  }
  
  const updateData = async () => {
    await UpdateBrandById(brand.value)
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
        await DeleteBrandById(id)
        ElMessage.success('删除成功')
        fetchData()
      })
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
  