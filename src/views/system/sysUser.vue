<template>
    <!---搜索表单-->
    <div class="search-div">
        <el-form label-width="70px" size="small">
            <el-row>
                <el-col :span="12">
                <el-form-item label="关键字">
                    <el-input
                    v-model="queryDto.keyword"
                    style="width: 100%"
                    placeholder="用户名、姓名、手机号码"
                    ></el-input>
                </el-form-item>
                </el-col>
                <el-col :span="12">
                <el-form-item label="创建时间">
                    <el-date-picker
                    v-model="createTimes"
                    type="daterange"
                    range-separator="To"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    />
                </el-form-item>
                </el-col>
            </el-row>
            <el-row style="display:flex">
                <el-button type="primary" size="small" @click="searchSysUser">
                搜索
                </el-button>
                <el-button size="small" @click="resetData">重置</el-button>
            </el-row>
        </el-form>
    </div>  

    <!--添加按钮-->
    <div class="tools-div">
        <el-button type="success" size="small" @click="addShow">添 加</el-button>
    </div>

    <!---数据表格-->
    <el-table :data="list" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机" />
        <el-table-column prop="avatar" label="头像" #default="scope">
            <img :src="scope.row.avatar" width="50" />
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" #default="scope">
            {{ scope.row.status == 1 ? '正常' : '停用' }}
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" align="center" width="280" #default="scope">
            <el-button type="primary" size="small" @click="editSysUser(scope.row)">
                修改
            </el-button>
            <el-button type="danger" size="small" @click="deleteById(scope.row)">
                删除
            </el-button>
            <el-button type="warning" size="small" @click="showAssignRole(scope.row)">
                分配角色
            </el-button>
        </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="pageParams.page"
        v-model:page-size="pageParams.limit"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="fetchData"
        @current-change="fetchData"
        layout="total, sizes, prev, pager, next"
        :total="total"
    />

    <!-- 添加/修改用户对话框 -->
    <el-dialog v-model="dialogVisible" title="添加或修改" width="40%">
        <el-form label-width="120px">
            <el-form-item label="用户名">
                <el-input v-model="sysUser.username"/>
            </el-form-item>
            <el-form-item v-if="sysUser.id == null" label="密码">
                <el-input type="password" show-password v-model="sysUser.password"/>
            </el-form-item>
            <el-form-item label="姓名">
                <el-input v-model="sysUser.name"/>
            </el-form-item>
            <el-form-item label="手机">
                <el-input v-model="sysUser.phone"/>
            </el-form-item>
            <el-form-item label="头像">
                <el-upload
                    class="avatar-uploader"
                    action="/admin/system/fileUpload"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :headers="headers"
                >
                    <img v-if="sysUser.avatar" :src="sysUser.avatar" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item label="描述">
                <el-input v-model="sysUser.description"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submit">提交</el-button>
                <el-button @click="dialogVisible = false">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="dialogRoleVisible" title="分配角色" width="40%">
        <el-form label-width="80px">
            <el-form-item label="用户名">
                <el-input disabled :value="sysUser.username"></el-input>
            </el-form-item>

            <el-form-item label="角色列表">
                <el-checkbox-group v-model="userRoleIds">
                    <el-checkbox v-for="role in allRoles" :key="role.id" :label="role.id">
                        {{ role.roleName }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="doAssign">提交</el-button>
                <el-button @click="dialogRoleVisible = false">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useApp } from '@/pinia/modules/app';
import { 
    GetSysUserListByPage, 
    SaveSysUser, 
    UpdateSysUser, 
    DeleteSysUserById,
    DoAssignRoleToUser
} from '@/api/sysuser';
import { GetAllRoleList } from '@/api/sysRole';

// 表格数据
const list = ref([]);
// 分页相关
const total = ref(0);
const pageParams = ref({
    page: 1,
    limit: 10
});

// 搜索参数
const queryDto = ref({
    keyword: "",
    createTimeBegin: "",
    createTimeEnd: ""
});
const createTimes = ref([]);

// 添加/修改表单相关
const dialogVisible = ref(false);
const sysUser = ref({});
const headers = {
    token: useApp().authorization.token
};

// 角色分配相关
const dialogRoleVisible = ref(false);
const userRoleIds = ref([]);
const allRoles = ref([]);

// 页面初始化加载数据
onMounted(() => {
    fetchData();
});

// 获取用户列表数据
const fetchData = async () => {
    if (createTimes.value.length == 2) {
        queryDto.value.createTimeBegin = createTimes.value[0];
        queryDto.value.createTimeEnd = createTimes.value[1];
    }
    const { code, data } = await GetSysUserListByPage(
        pageParams.value.page, 
        pageParams.value.limit, 
        queryDto.value
    );
    
    if (code === 200) {
        list.value = data.records;
        total.value = data.total;
    }
};

// 搜索
const searchSysUser = () => {
    pageParams.value.page = 1;
    fetchData();
};

// 重置搜索
const resetData = () => {
    queryDto.value = {
        keyword: "",
        createTimeBegin: "",
        createTimeEnd: ""
    };
    createTimes.value = [];
    pageParams.value.page = 1;
    fetchData();
};

// 添加用户
const addShow = () => {
    sysUser.value = {};
    dialogVisible.value = true;
};

// 修改用户
const editSysUser = (row) => {
    sysUser.value = {...row};
    dialogVisible.value = true;
};

// 提交表单
const submit = async () => {
    if (!sysUser.value.id) {
        // 新增
        const { code, message } = await SaveSysUser(sysUser.value);
        if (code === 200) {
            dialogVisible.value = false;
            ElMessage.success('添加成功');
            fetchData();
        } else {
            ElMessage.error(message);
        }
    } else {
        // 修改
        const { code, message } = await UpdateSysUser(sysUser.value);
        if (code === 200) {
            dialogVisible.value = false;
            ElMessage.success('修改成功');
            fetchData();
        } else {
            ElMessage.error(message);
        }
    }
};

// 删除用户
const deleteById = (row) => {
    ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        const { code } = await DeleteSysUserById(row.id);
        if (code === 200) {
            ElMessage.success('删除成功');
            fetchData();
        }
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
};

// 头像上传成功回调
const handleAvatarSuccess = (response) => {
    if (response.code === 200) {
        sysUser.value.avatar = response.data;
        ElMessage.success('上传成功');
    } else {
        ElMessage.error('上传失败');
    }
};

// 显示分配角色对话框
const showAssignRole = async (row) => {
    sysUser.value = row;
    dialogRoleVisible.value = true;
    
    // 获取所有角色和用户已分配角色
    const { code, data } = await GetAllRoleList(row.id);
    if (code === 200) {
        allRoles.value = data.allRolesList;
        userRoleIds.value = data.sysUserRoles;
    }
};

// 分配角色
const doAssign = async () => {
    const { code } = await DoAssignRoleToUser({
        userId: sysUser.value.id,
        roleIdList: userRoleIds.value
    });
    
    if (code === 200) {
        ElMessage.success('角色分配成功');
        dialogRoleVisible.value = false;
    }
};
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
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
