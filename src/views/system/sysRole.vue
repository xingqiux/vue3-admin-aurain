<template>
    <div class="search-div">
        <!-- 搜索表单 -->
        <el-form label-width="70px" size="small">
            <el-form-item label="角色名称">
                <el-input v-model="queryDto.roleName" style="width: 100%" placeholder="角色名称"></el-input>
            </el-form-item>
            <el-row style="display:flex">
                <el-button type="primary" size="small" @click="searchSysRole">
                    搜索
                </el-button>
                <el-button size="small" @click="resetData">重置</el-button>
            </el-row>
        </el-form>

        <!-- 添加按钮 -->
        <div class="tools-div">
            <el-button type="success" size="small" @click="addShow">添 加</el-button>
        </div>

        <!--- 角色表格数据 -->
        <el-table :data="list" style="width: 100%">
            <el-table-column prop="roleName" label="角色名称" width="180" />
            <el-table-column prop="roleCode" label="角色code" width="180" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column label="操作" align="center" width="280">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="editShow(scope.row)">
                        修改
                    </el-button>
                    <el-button type="danger" size="small" @click="remove(scope.row.id)">
                        删除
                    </el-button>
                    <el-button type="warning" size="small" @click="showAssignMenu(scope.row)">
                        分配菜单
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--分页条-->
        <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.limit"
            :page-sizes="[10, 20, 50, 100]" @size-change="fetchData" @current-change="fetchData"
            layout="total, sizes, prev, pager, next" :total="total" />

        <!-- 添加/修改角色表单对话框 -->
        <el-dialog v-model="dialogVisible" title="添加或修改角色" width="30%">
            <el-form label-width="120px">
                <el-form-item label="角色名称">
                    <el-input v-model="sysRole.roleName" />
                </el-form-item>
                <el-form-item label="角色Code">
                    <el-input v-model="sysRole.roleCode" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="saveOrUpdate">提交</el-button>
                    <el-button @click="dialogVisible = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 分配菜单的对话框 
// tree组件添加ref属性，后期方便进行tree组件对象的获取
-->
        <el-dialog v-model="dialogMenuVisible" title="分配菜单" width="40%">
            <el-form label-width="80px">
                <el-tree 
                :data="sysMenuTreeList" 
                ref="tree" 
                show-checkbox 
                default-expand-all 
                :check-on-click-node="true"
                node-key="id" 
                :props=" {
                    children: 'children',
                    label: 'title'
                        }" />
                <el-form-item>
                    <el-button type="primary">提交</el-button>
                    <el-button @click="dialogMenuVisible = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { GetSysRoleListByPage, SaveSysRole, UpdateSysRole, DeleteSysRoleById } from '@/api/sysRole';
import { ElMessage, ElMessageBox } from 'element-plus';
import{GetSysRoleMenuIds} from '@/api/sysRole';

// 分页条总记录数
const total = ref(0);

// 定义表格数据模型
const list = ref([]);

//分页数据
const pageParamsForm = {
    page: 1, // 页码
    limit: 10, // 每页记录数
}
const pageParams = ref(pageParamsForm);     // 将pageParamsForm包装成支持响应式的对象

// 搜索表单数据
const queryDto = ref({ "roleName": "" });

// 对话框数据
const dialogVisible = ref(false);
const sysRole = ref({
    id: '',
    roleName: '',
    roleCode: ''
});

// 角色分配菜单数据
const dialogMenuVisible = ref(false)
const sysMenuTreeList = ref([])

// 树对象变量
const tree = ref() 

// 默认选中的菜单数据集合
let roleId = ref()

const showAssignMenu = async (row) => { 
  dialogMenuVisible.value = true
  roleId = String(row.id)


  const { data } = await GetSysRoleMenuIds(roleId)   // 请求后端地址获取所有的菜单数据，以及当前角色所对应的菜单数据
//   sysMenuTreeList.value = data.sysMenuList

  sysMenuTreeList.value = data.sysMenuList.map(menu => ({
    ...menu,
    id: String(menu.id),
    children: menu.children?.map(child => ({
      ...child,
      id: String(child.id)
    }))
  }))

  //   tree.value.setCheckedKeys(data.roleMenuIds)   // 进行数据回显

  // 转换选中ID为字符串
  const checkedIds = data.roleMenuIds.map(id => String(id))
  tree.value.setCheckedKeys(checkedIds)


}

// 页面加载完毕以后请求后端接口获取数据
onMounted(() => {
    fetchData();
});

// 搜索按钮点击事件处理函数
const searchSysRole = () => {
    fetchData();
}

// 重置按钮点击事件处理函数
const resetData = () => {
    queryDto.value.roleName = "";
    fetchData();
}

// 远程调用后端分页查询接口
const fetchData = async () => {
    console.log(queryDto.value)
    try {
        const { data, code, message } = await GetSysRoleListByPage(pageParams.value.page, pageParams.value.limit, queryDto.value);
        if (code === 200) {
            list.value = data.records;
            total.value = data.total;
        } else {
            ElMessage.error(message || '获取角色列表失败');
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('获取角色列表失败');
    }
}

// 显示添加对话框
const addShow = () => {
    sysRole.value = {
        id: '',
        roleName: '',
        roleCode: ''
    };
    dialogVisible.value = true;
}

// 显示修改对话框
const editShow = (row) => {
    sysRole.value = JSON.parse(JSON.stringify(row));
    dialogVisible.value = true;
}

// 保存或更新角色信息
const saveOrUpdate = async () => {
    if (!sysRole.value.roleName || !sysRole.value.roleCode) {
        ElMessage.warning('请填写完整角色信息');
        return;
    }

    try {
        if (sysRole.value.id) {
            // 更新角色
            const { code, message } = await UpdateSysRole(sysRole.value);
            if (code === 200) {
                ElMessage.success('修改成功');
                dialogVisible.value = false;
                fetchData();
            } else {
                ElMessage.error(message || '修改失败');
            }
        } else {
            // 添加角色
            const { code, message } = await SaveSysRole(sysRole.value);
            if (code === 200) {
                ElMessage.success('添加成功');
                dialogVisible.value = false;
                fetchData();
            } else {
                ElMessage.error(message || '添加失败');
            }
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('操作失败');
    }
}

// 删除角色
const remove = (id) => {
    ElMessageBox.confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const { code, message } = await DeleteSysRoleById(id);
            if (code === 200) {
                ElMessage.success('删除成功');
                fetchData();
            } else {
                ElMessage.error(message || '删除失败');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('删除失败');
        }
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
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
