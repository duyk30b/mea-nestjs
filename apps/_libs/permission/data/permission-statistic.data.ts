import { Permission } from '../../database/entities'
import { PermissionId } from '../permission.enum'

export const permissionStatistic: Permission[] = [
  {
    id: PermissionId.STATISTIC,
    level: 1,
    code: PermissionId[PermissionId.STATISTIC],
    isActive: 1,
    pathId: `${PermissionId.STATISTIC}`,
    name: 'Quản lý thống kê',
    parentId: 0,
    rootId: PermissionId.STATISTIC,
  },
  {
    id: PermissionId.STATISTIC_TICKET,
    level: 2,
    code: PermissionId[PermissionId.STATISTIC_TICKET],
    isActive: 1,
    pathId: `${PermissionId.STATISTIC}.${PermissionId.STATISTIC_TICKET}`,
    name: 'Xem thống kê phiếu thu',
    parentId: PermissionId.STATISTIC,
    rootId: PermissionId.STATISTIC,
  },
  {
    id: PermissionId.STATISTIC_RECEIPT,
    level: 2,
    code: PermissionId[PermissionId.STATISTIC_RECEIPT],
    isActive: 1,
    pathId: `${PermissionId.STATISTIC}.${PermissionId.STATISTIC_RECEIPT}`,
    name: 'Xem thống kê phiếu nhập',
    parentId: PermissionId.STATISTIC,
    rootId: PermissionId.STATISTIC,
  },
  {
    id: PermissionId.STATISTIC_PRODUCT,
    level: 2,
    code: PermissionId[PermissionId.STATISTIC_PRODUCT],
    isActive: 1,
    pathId: `${PermissionId.STATISTIC}.${PermissionId.STATISTIC_PRODUCT}`,
    name: 'Xem thống kê sản phẩm',
    parentId: PermissionId.STATISTIC,
    rootId: PermissionId.STATISTIC,
  },
  {
    id: PermissionId.STATISTIC_CUSTOMER,
    level: 2,
    code: PermissionId[PermissionId.STATISTIC_CUSTOMER],
    isActive: 1,
    pathId: `${PermissionId.STATISTIC}.${PermissionId.STATISTIC_CUSTOMER}`,
    name: 'Xem thống kê khách hàng',
    parentId: PermissionId.STATISTIC,
    rootId: PermissionId.STATISTIC,
  },
  {
    id: PermissionId.STATISTIC_PROCEDURE,
    level: 2,
    code: PermissionId[PermissionId.STATISTIC_PROCEDURE],
    isActive: 1,
    pathId: `${PermissionId.STATISTIC}.${PermissionId.STATISTIC_PROCEDURE}`,
    name: 'Xem thống kê dịch vụ',
    parentId: PermissionId.STATISTIC,
    rootId: PermissionId.STATISTIC,
  },
  {
    id: PermissionId.STATISTIC_LABORATORY,
    level: 2,
    code: PermissionId[PermissionId.STATISTIC_LABORATORY],
    isActive: 1,
    pathId: `${PermissionId.STATISTIC}.${PermissionId.STATISTIC_LABORATORY}`,
    name: 'Xem thống kê xét nghiệm',
    parentId: PermissionId.STATISTIC,
    rootId: PermissionId.STATISTIC,
  },
  {
    id: PermissionId.STATISTIC_RADIOLOGY,
    level: 2,
    code: PermissionId[PermissionId.STATISTIC_RADIOLOGY],
    isActive: 1,
    pathId: `${PermissionId.STATISTIC}.${PermissionId.STATISTIC_RADIOLOGY}`,
    name: 'Xem thống kê phiếu CĐHA',
    parentId: PermissionId.STATISTIC,
    rootId: PermissionId.STATISTIC,
  },
]
