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
    id: PermissionId.RECEPTION_CREATE_TICKET,
    level: 2,
    code: PermissionId[PermissionId.RECEPTION_CREATE_TICKET],
    isActive: 1,
    pathId: `${PermissionId.RECEPTION}.${PermissionId.RECEPTION_CREATE_TICKET}`,
    name: 'Tiếp đón mới',
    parentId: PermissionId.RECEPTION,
    rootId: PermissionId.RECEPTION,
  },
  {
    id: PermissionId.RECEPTION_DESTROY_TICKET,
    level: 2,
    code: PermissionId[PermissionId.RECEPTION_DESTROY_TICKET],
    isActive: 1,
    pathId: `${PermissionId.RECEPTION}.${PermissionId.RECEPTION_DESTROY_TICKET}`,
    name: 'Xóa tiếp đón',
    parentId: PermissionId.RECEPTION,
    rootId: PermissionId.RECEPTION,
  },
]
