import { Permission } from '../../database/entities'
import { PermissionId } from '../permission.enum'

export const permissionReception: Permission[] = [
  {
    id: PermissionId.RECEPTION,
    level: 1,
    code: PermissionId[PermissionId.RECEPTION],
    isActive: 1,
    pathId: `${PermissionId.RECEPTION}`,
    name: 'Quản lý tiếp đón',
    parentId: 0,
    rootId: PermissionId.RECEPTION,
  },
  {
    id: PermissionId.RECEPTION_MENU,
    level: 2,
    code: PermissionId[PermissionId.RECEPTION_MENU],
    isActive: 1,
    pathId: `${PermissionId.RECEPTION}.${PermissionId.RECEPTION_MENU}`,
    name: 'Xem menu danh sách tiếp đón',
    parentId: PermissionId.RECEPTION,
    rootId: PermissionId.RECEPTION,
  },
  {
    id: PermissionId.RECEPTION_CRUD_TICKET_DRAFT,
    level: 2,
    code: PermissionId[PermissionId.RECEPTION_CRUD_TICKET_DRAFT],
    isActive: 1,
    pathId: `${PermissionId.RECEPTION}.${PermissionId.RECEPTION_CRUD_TICKET_DRAFT}`,
    name: 'Thêm, sửa, xóa đón tiếp',
    parentId: PermissionId.RECEPTION,
    rootId: PermissionId.RECEPTION,
  },
]
