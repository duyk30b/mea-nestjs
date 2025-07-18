import { Permission } from '../../database/entities'
import { PermissionId } from '../permission.enum'

export const permissionPayment: Permission[] = [
  {
    id: PermissionId.PAYMENT,
    level: 1,
    code: PermissionId[PermissionId.PAYMENT],
    isActive: 1,
    pathId: `${PermissionId.PAYMENT}`,
    name: 'Quản lý tài chính',
    parentId: 0,
    rootId: PermissionId.PAYMENT,
  },
  {
    id: PermissionId.PAYMENT_MENU,
    level: 2,
    code: PermissionId[PermissionId.PAYMENT_MENU],
    isActive: 1,
    pathId: `${PermissionId.PAYMENT}.${PermissionId.PAYMENT_MENU}`,
    name: 'Xem menu phiếu thu/chi',
    parentId: PermissionId.PAYMENT,
    rootId: PermissionId.PAYMENT,
  },
  {
    id: PermissionId.PAYMENT_CUSTOMER_MONEY_IN,
    level: 2,
    code: PermissionId[PermissionId.PAYMENT_CUSTOMER_MONEY_IN],
    isActive: 1,
    pathId: `${PermissionId.PAYMENT}.${PermissionId.PAYMENT_CUSTOMER_MONEY_IN}`,
    name: 'Tạo phiếu thu khách hàng',
    parentId: PermissionId.PAYMENT,
    rootId: PermissionId.PAYMENT,
  },
  {
    id: PermissionId.PAYMENT_DISTRIBUTOR_MONEY_OUT,
    level: 2,
    code: PermissionId[PermissionId.PAYMENT_DISTRIBUTOR_MONEY_OUT],
    isActive: 1,
    pathId: `${PermissionId.PAYMENT}.${PermissionId.PAYMENT_DISTRIBUTOR_MONEY_OUT}`,
    name: 'Tạo phiếu chi nhà cung cấp',
    parentId: PermissionId.PAYMENT,
    rootId: PermissionId.PAYMENT,
  },
  {
    id: PermissionId.PAYMENT_OTHER_MONEY_IN,
    level: 2,
    code: PermissionId[PermissionId.PAYMENT_OTHER_MONEY_IN],
    isActive: 1,
    pathId: `${PermissionId.PAYMENT}.${PermissionId.PAYMENT_OTHER_MONEY_IN}`,
    name: 'Tạo phiếu thu khác',
    parentId: PermissionId.PAYMENT,
    rootId: PermissionId.PAYMENT,
  },
  {
    id: PermissionId.PAYMENT_OTHER_MONEY_OUT,
    level: 2,
    code: PermissionId[PermissionId.PAYMENT_OTHER_MONEY_OUT],
    isActive: 1,
    pathId: `${PermissionId.PAYMENT}.${PermissionId.PAYMENT_OTHER_MONEY_OUT}`,
    name: 'Tạo phiếu chi khác',
    parentId: PermissionId.PAYMENT,
    rootId: PermissionId.PAYMENT,
  },
]
