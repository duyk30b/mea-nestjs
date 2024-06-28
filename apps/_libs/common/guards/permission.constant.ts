// export enum PermissionStatus {
//   CHECK = 1,
//   PUBLIC = 2,
//   BLOCK = 3,
// }

// export enum PermissionId {
//   USER = 1,
//   USER_LIST = 100,
//   USER_INSERT = 101,
//   USER_UPDATE = 102,
//   USER_DELETE = 103,
// }

// export type PermissionDataType = {
//   id: PermissionId
//   level: number
//   code: keyof typeof PermissionId
//   name: string
//   status: PermissionStatus
//   pathId: string
// }

// export const PermissionData: PermissionDataType[] = [
//   {
//     id: 1,
//     level: 1,
//     code: 'USER',
//     status: PermissionStatus.CHECK,
//     pathId: '1',
//     name: 'Quản lý nhân viên',
//   },
//   {
//     id: 100,
//     level: 2,
//     code: 'USER_LIST',
//     status: PermissionStatus.CHECK,
//     pathId: '1.100',
//     name: 'Xem danh sách nhân viên',
//   },
//   {
//     id: 101,
//     level: 2,
//     code: 'USER_INSERT',
//     status: PermissionStatus.CHECK,
//     pathId: '1.101',
//     name: 'Thêm nhân viên',
//   },
//   {
//     id: 102,
//     level: 2,
//     code: 'USER_UPDATE',
//     status: PermissionStatus.CHECK,
//     pathId: '1.102',
//     name: 'Sửa nhân viên',
//   },
//   {
//     id: 103,
//     level: 2,
//     code: 'USER_DELETE',
//     status: PermissionStatus.CHECK,
//     pathId: '1.103',
//     name: 'Xóa nhân viên',
//   },
// ]

// export const PermissionDataMap: Record<string, PermissionDataType> = {}
// PermissionData.forEach((i) => (PermissionDataMap[i.id] = i))

// // export const PermissionDataMap: { [P in `${PermissionId}`]?: PermissionDataType } = {}
// // export type PermissionDataType = (typeof PermissionData)[keyof typeof PermissionData]
// // export type PermissionKey = keyof typeof PermissionData
// // export type PermissionId = {
// //     [K in keyof typeof PermissionData]: K
// // }
