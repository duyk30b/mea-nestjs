import { Permission } from '../../database/entities'
import { PermissionId } from '../permission.enum'

export const permissionCustomer: Permission[] = [
  {
    id: PermissionId.CUSTOMER,
    level: 1,
    code: PermissionId[PermissionId.CUSTOMER],
    isActive: 1,
    pathId: `${PermissionId.CUSTOMER}`,
    name: 'Quản lý khách hàng',
    parentId: 0,
    rootId: PermissionId.CUSTOMER,
  },
  {
    id: PermissionId.CUSTOMER_MENU,
    level: 2,
    code: PermissionId[PermissionId.CUSTOMER_MENU],
    isActive: 1,
    pathId: `${PermissionId.CUSTOMER}.${PermissionId.CUSTOMER_MENU}`,
    name: 'Xem menu khách hàng',
    parentId: PermissionId.CUSTOMER,
    rootId: PermissionId.CUSTOMER,
  },
  {
    id: PermissionId.CUSTOMER_CRUD,
    level: 2,
    code: PermissionId[PermissionId.CUSTOMER_CRUD],
    isActive: 1,
    pathId: `${PermissionId.CUSTOMER}.${PermissionId.CUSTOMER_CRUD}`,
    name: 'Thêm, sửa, xóa khách hàng',
    parentId: PermissionId.CUSTOMER,
    rootId: PermissionId.CUSTOMER,
  },
]
