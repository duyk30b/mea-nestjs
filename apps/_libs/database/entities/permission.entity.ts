import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum PermissionId {
  ORGANIZATION = 1,
  ORGANIZATION_UPDATE_INFO = 100,
  ORGANIZATION_SETTING_UPSERT = 101,
  ORGANIZATION_VERIFY_EMAIL = 102,

  ROLE = 2,
  ROLE_READ = 200,
  ROLE_CREATE = 201,
  ROLE_UPDATE = 202,
  ROLE_DELETE = 203,

  USER = 3,
  USER_READ = 300,
  USER_CREATE = 301,
  USER_UPDATE = 302,
  USER_DELETE = 303,
  USER_DEVICE_LOGOUT = 304,

  PRODUCT = 4,
  PRODUCT_READ = 400,
  PRODUCT_CREATE = 401,
  PRODUCT_UPDATE = 402,
  PRODUCT_DELETE = 403,
  PRODUCT_DOWNLOAD_EXCEL = 404,
  BATCH_READ = 410,
  BATCH_CREATE = 411,
  BATCH_UPDATE = 412,
  BATCH_DELETE = 413,
  READ_COST_PRICE = 414,
  READ_MOVEMENT = 420,

  DISTRIBUTOR = 5,
  DISTRIBUTOR_READ = 500,
  DISTRIBUTOR_CREATE = 501,
  DISTRIBUTOR_UPDATE = 502,
  DISTRIBUTOR_DELETE = 503,
  DISTRIBUTOR_PAYMENT_READ = 510,
  DISTRIBUTOR_PAYMENT_PAY_DEBT = 511,

  CUSTOMER = 6,
  CUSTOMER_READ = 600,
  CUSTOMER_CREATE = 601,
  CUSTOMER_UPDATE = 602,
  CUSTOMER_DELETE = 603,
  CUSTOMER_DOWNLOAD_EXCEL = 604,
  CUSTOMER_PAYMENT_READ = 610,
  CUSTOMER_PAY_DEBT = 611,

  PROCEDURE = 7,
  PROCEDURE_READ = 700,
  PROCEDURE_CREATE = 701,
  PROCEDURE_UPDATE = 702,
  PROCEDURE_DELETE = 703,

  RADIOLOGY = 8,
  RADIOLOGY_READ = 800,
  RADIOLOGY_CREATE = 801,
  RADIOLOGY_UPDATE = 802,
  RADIOLOGY_DELETE = 803,

  RECEIPT = 9,
  RECEIPT_READ = 900,
  RECEIPT_CREATE_DRAFT = 901,
  RECEIPT_PREPAYMENT = 902,
  RECEIPT_REFUND_PREPAYMENT = 903,
  RECEIPT_SEND_PRODUCT = 904,
  RECEIPT_PAY_DEBT = 905,
  RECEIPT_UPDATE_RECEIPT_DRAFT_AND_RECEIPT_PREPAYMENT = 906,
  RECEIPT_UPDATE_RECEIPT_DEBT_AND_RECEIPT_SUCCESS = 907,
  RECEIPT_RETURN_PRODUCT = 908,
  RECEIPT_DELETE = 909,

  TICKET_ORDER = 10,
  TICKET_ORDER_READ = 1000,
  TICKET_ORDER_CREATE_DRAFT = 1001,
  TICKET_ORDER_UPDATE_DRAFT_APPROVED = 1002,
  TICKET_ORDER_DESTROY_DRAFT = 1003,
  TICKET_ORDER_CREATE_DEBT_SUCCESS = 1004,
  TICKET_ORDER_UPDATE_DEBT_SUCCESS = 1005,
  TICKET_ORDER_PREPAYMENT = 1006,
  TICKET_ORDER_REFUND_OVERPAID = 1007,
  TICKET_ORDER_SEND_PRODUCT = 1008,
  TICKET_ORDER_RETURN_PRODUCT = 1009,
  TICKET_ORDER_PAYMENT_AND_CLOSE = 1010,
  TICKET_ORDER_PAY_DEBT = 1011,
  TICKET_ORDER_REOPEN = 1012,
  TICKET_ORDER_CANCEL = 1013,

  TICKET_CLINIC = 11,
  TICKET_CLINIC_READ = 1100,
  TICKET_CLINIC_REGISTER_NEW = 1101,
  TICKET_CLINIC_START_CHECKUP = 1102,
  TICKET_CLINIC_UPDATE_DIAGNOSIS = 1103,
  TICKET_CLINIC_CHANGE_TICKET_PROCEDURE_LIST = 1104,
  TICKET_CLINIC_READ_TICKET_RADIOLOGY = 1105,
  TICKET_CLINIC_CHANGE_TICKET_RADIOLOGY_LIST = 1106,
  TICKET_CLINIC_UPSERT_TICKET_RADIOLOGY_RESULT = 1107,
  TICKET_CLINIC_CHANGE_CONSUMABLE = 1108,
  TICKET_CLINIC_CHANGE_PRESCRIPTION = 1109,
  TICKET_CLINIC_CHANGE_ITEMS_MONEY = 1110,
  TICKET_CLINIC_PREPAYMENT = 1111,
  TICKET_CLINIC_REFUND_OVERPAID = 1112,
  TICKET_CLINIC_PAY_DEBT = 1113,
  TICKET_CLINIC_SEND_PRODUCT = 1114,
  TICKET_CLINIC_RETURN_PRODUCT = 1115,
  TICKET_CLINIC_CLOSE = 1116,
  TICKET_CLINIC_REOPEN = 1117,

  APPOINTMENT = 12,
  APPOINTMENT_READ = 1200,
  APPOINTMENT_CREATE = 1201,
  APPOINTMENT_UPDATE = 1202,
  APPOINTMENT_DELETE = 1203,

  STATISTIC = 13,
  STATISTIC_PRODUCT = 1300,
  STATISTIC_PROCEDURE = 1301,
  STATISTIC_CUSTOMER = 1302,
  STATISTIC_RECEIPT = 1303,
  STATISTIC_TICKET = 1304,
}

@Entity('Permission')
export default class Permission {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  @Expose()
  id: PermissionId

  @Column({ type: 'smallint' })
  @Expose()
  level: number

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  code: string

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  name: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  parentId: PermissionId | 0

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  rootId: PermissionId | 0

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  pathId: string

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  static fromRaw(raw: { [P in keyof Permission]: any }) {
    if (!raw) return null
    const entity = new Permission()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Permission]: any }[]) {
    return raws.map((i) => Permission.fromRaw(i))
  }
}

export type PermissionRelationType = Pick<Permission, never>

export type PermissionSortType = Pick<Permission, 'id'>

export type PermissionInsertType = Omit<
  Permission,
  keyof PermissionRelationType | keyof Pick<Permission, 'id'>
>

export type PermissionUpdateType = Omit<
  Permission,
  keyof PermissionRelationType | keyof Pick<Permission, 'id'>
>
