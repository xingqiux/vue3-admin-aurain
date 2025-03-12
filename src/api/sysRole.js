import request from '@/utils/request'

// 分页查询角色数据
export const GetSysRoleListByPage = (pageNum , pageSize , queryDto) => {
    return request({
        url: '/admin/system/sysRole/findByPage/' + pageNum + "/" + pageSize,
        method: 'get',
        params: queryDto
    })
}

// 添加角色请求方法
export const SaveSysRole = (data) => {
    return request({
        url: '/admin/system/sysRole/saveSysRole',
        method: 'post',
        data
    })
}

// 保存修改
export const UpdateSysRole = (data) => {
    return request({
        url: '/admin/system/sysRole/updateSysRole',
        method: 'put',
        data
    })
}
// 删除角色
export const DeleteSysRoleById = (roleId) => {
    return request({
        url: '/admin/system/sysRole/deleteById/' + roleId,
        method: 'delete'
    })
}


// // 查询所有角色及用户已分配角色
// export const GetAllRoleList = (userId) => {
//     return request({
//         url: '/admin/system/sysRole/findAllRoles/' + userId,
//         method: 'get'
//     })
// }

// 查询所有角色及用户已分配角色
export const GetAllRoleList = (userId) => {
    // 使用模板字符串避免隐式转换
    return request({
        url: `/admin/system/sysRole/findAllRoles/${userId}`,
        method: 'get'
    })
}
