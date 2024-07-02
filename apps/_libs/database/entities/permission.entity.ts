import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum PermissionId {
  ORGANIZATION = 1,
  ORGANIZATION_UPDATE_INFO = 100,
  SETTING_UPSERT = 101,

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
  CUSTOMER_PAYMENT_READ = 610,
  CUSTOMER_PAYMENT_PAY_DEBT = 611,

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

  INVOICE = 10,
  INVOICE_READ = 1000,
  INVOICE_DRAFT = 1001,
  INVOICE_PREPAYMENT = 1002,
  INVOICE_REFUND_OVERPAID = 1003,
  INVOICE_PAY_DEBT = 1004,
  INVOICE_SEND_PRODUCT = 1005,
  INVOICE_RETURN_PRODUCT = 1006,
  INVOICE_FORCE_UPDATE = 1007,
  INVOICE_CANCEL = 1008,

  VISIT = 11,
  VISIT_READ = 1100,
  VISIT_CREATE = 1101,
  VISIT_START_CHECKUP = 1102,
  VISIT_DIAGNOSIS = 1103,
  VISIT_REPLACE_VISIT_PROCEDURE_LIST = 1104,
  VISIT_REPLACE_VISIT_RADIOLOGY_LIST = 1105,
  VISIT_PRESCRIPTION = 1106,
  VISIT_UPDATE_ITEMS_MONEY = 1107,
  VISIT_PREPAYMENT = 1108,
  VISIT_REFUND_OVERPAID = 119,
  VISIT_PAY_DEBT = 1110,
  VISIT_SEND_PRODUCT = 1111,
  VISIT_RETURN_PRODUCT = 1112,
  VISIT_CLOSE = 1113,
  VISIT_REOPEN = 1114,
  VISIT_RADIOLOGY_UPSERT = 1150,

  STATISTIC = 12,
  STATISTIC_PRODUCT = 1200,
  STATISTIC_PROCEDURE = 1201,
  STATISTIC_CUSTOMER = 1202,
  STATISTIC_RECEIPT = 1203,
  STATISTIC_INVOICE = 1204,
  STATISTIC_VISIT = 1205,
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
