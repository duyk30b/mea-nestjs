import { Permission } from '../../database/entities'
import { PermissionId } from '../permission.enum'

export const permissionFile: Permission[] = [
  {
    id: PermissionId.FILE,
    level: 1,
    code: PermissionId[PermissionId.FILE],
    isActive: 1,
    pathId: `${PermissionId.FILE}`,
    name: 'Quản lý File Excel',
    parentId: 0,
    rootId: PermissionId.FILE,
  },
  {
    id: PermissionId.FILE_EXCEL_DOWNLOAD_PRODUCT,
    level: 2,
    code: PermissionId[PermissionId.FILE_EXCEL_DOWNLOAD_PRODUCT],
    isActive: 1,
    pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_DOWNLOAD_PRODUCT}`,
    name: 'Tải file Excel danh sách sản phẩm',
    parentId: PermissionId.FILE,
    rootId: PermissionId.FILE,
  },
  {
    id: PermissionId.FILE_EXCEL_DOWNLOAD_CUSTOMER,
    level: 2,
    code: PermissionId[PermissionId.FILE_EXCEL_DOWNLOAD_CUSTOMER],
    isActive: 1,
    pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_DOWNLOAD_CUSTOMER}`,
    name: 'Tải file Excel danh sách khách hàng',
    parentId: PermissionId.FILE,
    rootId: PermissionId.FILE,
  },
  {
    id: PermissionId.FILE_EXCEL_DOWNLOAD_RECEIPT,
    level: 2,
    code: PermissionId[PermissionId.FILE_EXCEL_DOWNLOAD_RECEIPT],
    isActive: 1,
    pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_DOWNLOAD_RECEIPT}`,
    name: 'Tải file Excel danh sách phiếu nhập hàng',
    parentId: PermissionId.FILE,
    rootId: PermissionId.FILE,
  },
  {
    id: PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_ORDER,
    level: 2,
    code: PermissionId[PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_ORDER],
    isActive: 1,
    pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_ORDER}`,
    name: 'Tải file Excel danh sách bán hàng',
    parentId: PermissionId.FILE,
    rootId: PermissionId.FILE,
  },
  {
    id: PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_CLINIC,
    level: 2,
    code: PermissionId[PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_CLINIC],
    isActive: 1,
    pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_CLINIC}`,
    name: 'Tải file Excel danh sách phiếu khám',
    parentId: PermissionId.FILE,
    rootId: PermissionId.FILE,
  },
  {
    id: PermissionId.FILE_EXCEL_UPLOAD_PRODUCT,
    level: 2,
    code: PermissionId[PermissionId.FILE_EXCEL_UPLOAD_PRODUCT],
    isActive: 1,
    pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_UPLOAD_PRODUCT}`,
    name: 'Upload file Excel danh sách sản phẩm',
    parentId: PermissionId.FILE,
    rootId: PermissionId.FILE,
  },
  {
    id: PermissionId.FILE_EXCEL_UPLOAD_CUSTOMER,
    level: 2,
    code: PermissionId[PermissionId.FILE_EXCEL_UPLOAD_CUSTOMER],
    isActive: 1,
    pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_UPLOAD_CUSTOMER}`,
    name: 'Upload file Excel danh sách khách hàng',
    parentId: PermissionId.FILE,
    rootId: PermissionId.FILE,
  },
  {
    id: PermissionId.FILE_EXCEL_UPLOAD_RECEIPT,
    level: 2,
    code: PermissionId[PermissionId.FILE_EXCEL_UPLOAD_RECEIPT],
    isActive: 1,
    pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_UPLOAD_RECEIPT}`,
    name: 'Upload file Excel danh sách phiếu nhập hàng',
    parentId: PermissionId.FILE,
    rootId: PermissionId.FILE,
  },
  // {
  //   id: PermissionId.FILE_EXCEL_UPLOAD_TICKET_ORDER,
  //   level: 2,
  //   code: PermissionId[PermissionId.FILE_EXCEL_UPLOAD_TICKET_ORDER],
  //   isActive: 1,
  //   pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_UPLOAD_TICKET_ORDER}`,
  //   name: 'Upload file Excel danh sách bán hàng',
  //   parentId: PermissionId.FILE,
  //   rootId: PermissionId.FILE,
  // },
  // {
  //   id: PermissionId.FILE_EXCEL_UPLOAD_TICKET_CLINIC,
  //   level: 2,
  //   code: PermissionId[PermissionId.FILE_EXCEL_UPLOAD_TICKET_CLINIC],
  //   isActive: 1,
  //   pathId: `${PermissionId.FILE}.${PermissionId.FILE_EXCEL_UPLOAD_TICKET_CLINIC}`,
  //   name: 'Upload file Excel danh sách phiếu khám',
  //   parentId: PermissionId.FILE,
  //   rootId: PermissionId.FILE,
  // },
]
