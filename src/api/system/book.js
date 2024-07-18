import request from '@/utils/request'

// 查询豆瓣图书列表
export function listBook(query) {
  return request({
    url: '/system/book/list',
    method: 'get',
    params: query
  })
}

// 查询豆瓣图书详细
export function getBook(id) {
  return request({
    url: '/system/book/' + id,
    method: 'get'
  })
}

// 新增豆瓣图书
export function addBook(data) {
  return request({
    url: '/system/book',
    method: 'post',
    data: data
  })
}

// 修改豆瓣图书
export function updateBook(data) {
  return request({
    url: '/system/book',
    method: 'put',
    data: data
  })
}

// 删除豆瓣图书
export function delBook(id) {
  return request({
    url: '/system/book/' + id,
    method: 'delete'
  })
}

export function lineChart(query) {
  return request({
    url: '/system/book/lineChart',
    method: 'get',
    params: query
  })
}
