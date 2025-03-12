import request from '@/utils/request'

// 分页查询用户列表
export const GetSysUserListByPage = (pageNum, pageSize, queryDto) => {
    return request({
        url: "/admin/system/sysUser/findByPage/" + pageNum + "/" + pageSize,
        method: 'get',
        params: queryDto
    })
}

// 添加用户
export const SaveSysUser = (data) => {
    return request({
        url: "/admin/system/sysUser/saveSysUser",
        method: "post",
        data
    })
}

// 修改用户
export const UpdateSysUser = (data) => {
    return request({
        url: "/admin/system/sysUser/updateSysUser",
        method: "put",
        data
    })
}

// 删除用户
export const DeleteSysUserById = (userId) => {
    return request({
        url: "/admin/system/sysUser/deleteById/" + userId,
        method: 'delete'
    })
}

// 给用户分配角色
export const DoAssignRoleToUser = (assignRoleDto) => {
    return request({
        url: "/admin/system/sysUser/doAssign",
        method: 'post',
        data: assignRoleDto
    })
}
