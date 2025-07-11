import { Permission } from '../../database/entities'
import { PermissionId } from '../permission.enum'

export const permissionPosition: Permission[] = [
  {
    id: PermissionId.POSITION,
    level: 1,
    code: PermissionId[PermissionId.POSITION],
    isActive: 1,
    pathId: `${PermissionId.POSITION}`,
    name: 'Quản lý vị trí làm việc',
    parentId: 0,
    rootId: PermissionId.POSITION,
  },
  {
    id: PermissionId.POSITION_MENU,
    level: 2,
    code: PermissionId[PermissionId.POSITION_MENU],
    isActive: 1,
    pathId: `${PermissionId.POSITION}.${PermissionId.POSITION_MENU}`,
    name: 'Xem menu danh sách vị trí làm việc',
    parentId: PermissionId.POSITION,
    rootId: PermissionId.POSITION,
  },
  {
    id: PermissionId.POSITION_CREATE,
    level: 2,
    code: PermissionId[PermissionId.POSITION_CREATE],
    isActive: 1,
    pathId: `${PermissionId.POSITION}.${PermissionId.POSITION_CREATE}`,
    name: 'Thêm vị trí làm việc mới',
    parentId: PermissionId.POSITION,
    rootId: PermissionId.POSITION,
  },
  {
    id: PermissionId.POSITION_UPDATE,
    level: 2,
    code: PermissionId[PermissionId.POSITION_UPDATE],
    isActive: 1,
    pathId: `${PermissionId.POSITION}.${PermissionId.POSITION_UPDATE}`,
    name: 'Sửa vị trí làm việc',
    parentId: PermissionId.POSITION,
    rootId: PermissionId.POSITION,
  },
  {
    id: PermissionId.POSITION_DELETE,
    level: 2,
    code: PermissionId[PermissionId.POSITION_DELETE],
    isActive: 1,
    pathId: `${PermissionId.POSITION}.${PermissionId.POSITION_DELETE}`,
    name: 'Xóa vị trí làm việc',
    parentId: PermissionId.POSITION,
    rootId: PermissionId.POSITION,
  },
]
