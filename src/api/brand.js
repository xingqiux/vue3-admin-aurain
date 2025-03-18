
// src/api/brand.js
import request from '@/utils/request'

 api_name = '/admin/product/brand'

export const GetBrandPageList = (page, limit) => {
  return request({
    url: `${api_name}/${page}/${limit}`,
    method: 'get'
  })
}

export const SaveBrand = brand => {
  return request({
    url: `${api_name}/save`,
    method: 'post',
    data: brand,
  })
}

export const UpdateBrandById = brand => {
  return request({
    url: `${api_name}/updateById`,
    method: 'put',
    data: brand,
  })
}

export const DeleteBrandById = id => {
  return request({
    url: `${api_name}/deleteById/${id}`,
    method: 'delete',
  })
}
