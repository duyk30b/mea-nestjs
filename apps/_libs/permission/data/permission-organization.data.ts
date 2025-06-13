import { Permission } from '../../database/entities'
import { PermissionId } from '../permission.enum'

export const permissionOrganization: Permission[] = [
  {
    id: PermissionId.ORGANIZATION,
    level: 1,
    code: PermissionId[PermissionId.ORGANIZATION],
    isActive: 1,
    pathId: `${PermissionId.ORGANIZATION}`,
    name: 'Quản lý cơ sở (Admin)',
    parentId: 0,
    rootId: PermissionId.ORGANIZATION,
  },
  {
    id: PermissionId.ORGANIZATION_UPDATE_INFO,
    level: 2,
    code: PermissionId[PermissionId.ORGANIZATION_UPDATE_INFO],
    isActive: 1,
    pathId: `${PermissionId.ORGANIZATION}.${PermissionId.ORGANIZATION_UPDATE_INFO}`,
    name: 'Sửa thông tin cơ sở',
    parentId: PermissionId.ORGANIZATION,
    rootId: PermissionId.ORGANIZATION,
  },
  {
    id: PermissionId.ORGANIZATION_SETTING_UPSERT,
    level: 2,
    code: PermissionId[PermissionId.ORGANIZATION_SETTING_UPSERT],
    isActive: 1,
    pathId: `${PermissionId.ORGANIZATION}.${PermissionId.ORGANIZATION_SETTING_UPSERT}`,
    name: 'Chỉnh sửa cài đặt',
    parentId: PermissionId.ORGANIZATION,
    rootId: PermissionId.ORGANIZATION,
  },
  {
    id: PermissionId.ORGANIZATION_VERIFY_EMAIL,
    level: 2,
    code: PermissionId[PermissionId.ORGANIZATION_VERIFY_EMAIL],
    isActive: 1,
    pathId: `${PermissionId.ORGANIZATION}.${PermissionId.ORGANIZATION_VERIFY_EMAIL}`,
    name: 'Sửa và kích hoạt email',
    parentId: PermissionId.ORGANIZATION,
    rootId: PermissionId.ORGANIZATION,
  },
]
