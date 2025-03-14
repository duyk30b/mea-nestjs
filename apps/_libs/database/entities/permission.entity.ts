import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum PermissionId {
  ORGANIZATION = 1,
  ORGANIZATION_UPDATE_INFO = 100,
  ORGANIZATION_SETTING_UPSERT = 101,
  ORGANIZATION_VERIFY_EMAIL = 102,

  USER = 2,
  ACCOUNT_CRUD = 201,
  ROLE_CRUD = 202,
  COMMISSION_CRUD = 203,

  STATISTIC = 4,
  STATISTIC_TICKET = 401,
  STATISTIC_RECEIPT = 402,
  STATISTIC_PRODUCT = 403,
  STATISTIC_CUSTOMER = 404,
  STATISTIC_PROCEDURE = 405,
  STATISTIC_LABORATORY = 406,
  STATISTIC_RADIOLOGY = 407,

  MASTER_DATA = 5,
  MASTER_DATA_WAREHOUSE = 501,
  MASTER_DATA_PROCEDURE = 502,
  MASTER_DATA_LABORATORY = 503,
  MASTER_DATA_RADIOLOGY = 504,
  MASTER_DATA_TICKET_SOURCE = 505,
  MASTER_DATA_PRINT_HTML = 506,
  MASTER_DATA_PRESCRIPTION_SAMPLE = 507,

  PRODUCT = 6,
  PRODUCT_READ = 600,
  PRODUCT_CREATE = 601,
  PRODUCT_UPDATE = 602,
  PRODUCT_DELETE = 603,
  PRODUCT_DOWNLOAD_EXCEL = 604,
  BATCH_READ = 610,
  BATCH_CREATE = 611,
  BATCH_UPDATE = 612,
  BATCH_DELETE = 613,
  READ_COST_PRICE = 614,
  BATCH_CHANGE_QUANTITY_AND_COST_PRICE = 615,
  READ_MOVEMENT = 620,

  DISTRIBUTOR = 7,
  DISTRIBUTOR_READ = 700,
  DISTRIBUTOR_CREATE = 701,
  DISTRIBUTOR_UPDATE = 702,
  DISTRIBUTOR_DELETE = 703,
  DISTRIBUTOR_PAYMENT_READ = 710,
  DISTRIBUTOR_PAYMENT_PAY_DEBT = 711,

  CUSTOMER = 8,
  CUSTOMER_READ = 800,
  CUSTOMER_CREATE = 801,
  CUSTOMER_UPDATE = 802,
  CUSTOMER_DELETE = 803,
  CUSTOMER_DOWNLOAD_EXCEL = 804,
  CUSTOMER_PAYMENT_READ = 810,
  CUSTOMER_PAY_DEBT = 811,

  RECEIPT = 9,
  RECEIPT_READ = 900,
  RECEIPT_CREATE_DRAFT = 901,
  RECEIPT_UPDATE_DRAFT_PREPAYMENT = 902,
  RECEIPT_DESTROY_DRAFT = 903,
  RECEIPT_PAYMENT = 904,
  RECEIPT_REFUND_PAYMENT = 905,
  RECEIPT_PAY_DEBT = 906,
  RECEIPT_SEND_PRODUCT = 907,
  RECEIPT_CANCEL = 908,

  APPOINTMENT = 10,
  APPOINTMENT_READ = 1000,
  APPOINTMENT_CREATE = 1001,
  APPOINTMENT_UPDATE = 1002,
  APPOINTMENT_DELETE = 1003,
  APPOINTMENT_REGISTER_TICKET = 1004,

  TICKET_PROCEDURE_RESULT = 11,
  TICKET_LABORATORY_RESULT = 12,
  TICKET_RADIOLOGY_RESULT = 13,

  TICKET_ORDER = 50,
  TICKET_ORDER_READ = 5000,
  TICKET_ORDER_CREATE_DRAFT = 5001,
  TICKET_ORDER_UPDATE_DRAFT_APPROVED = 5002,
  TICKET_ORDER_DESTROY_DRAFT = 5003,
  TICKET_ORDER_CREATE_DEBT_SUCCESS = 5004,
  TICKET_ORDER_UPDATE_DEBT_SUCCESS = 5005,
  TICKET_ORDER_PREPAYMENT = 5006,
  TICKET_ORDER_REFUND_OVERPAID = 5007,
  TICKET_ORDER_SEND_PRODUCT = 5008,
  TICKET_ORDER_RETURN_PRODUCT = 5009,
  TICKET_ORDER_PAYMENT_AND_CLOSE = 5010,
  TICKET_ORDER_PAY_DEBT = 5011,
  TICKET_ORDER_REOPEN = 5012,
  TICKET_ORDER_CANCEL = 5013,

  TICKET_CLINIC = 51,
  TICKET_CLINIC_READ = 5100,
  TICKET_CLINIC_CREATE = 5101,
  TICKET_CLINIC_DESTROY_DRAFT_SCHEDULE = 5102,
  TICKET_CLINIC_START_CHECKUP = 5103,
  TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST = 5104,
  TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST = 5105,
  TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST = 5106,
  TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE = 5107,
  TICKET_CLINIC_UPDATE_TICKET_PRODUCT_PRESCRIPTION = 5108,
  TICKET_CLINIC_UPDATE_TICKET_USER_LIST = 5109,
  TICKET_CLINIC_CHANGE_DISCOUNT = 5110,
  TICKET_CLINIC_PREPAYMENT = 5111,
  TICKET_CLINIC_REFUND_OVERPAID = 5112,
  TICKET_CLINIC_PAY_DEBT = 5113,
  TICKET_CLINIC_SEND_PRODUCT = 5114,
  TICKET_CLINIC_RETURN_PRODUCT = 5115,
  TICKET_CLINIC_CLOSE = 5116,
  TICKET_CLINIC_REOPEN = 5117,

  TICKET_CLINIC_UPDATE_TICKET_ATTRIBUTE = 5150,
  TICKET_CLINIC_UPDATE_USER_COMMISSION = 5160,
}

@Entity('Permission')
export default class Permission {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  @Expose()
  id: PermissionId

  @Column({ type: 'smallint' })
  @Expose()
  level: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  code: string

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  parentId: PermissionId | 0

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  rootId: PermissionId | 0

  @Column({ type: 'varchar', length: 255 })
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

export type PermissionRelationType = {
  [P in keyof Pick<Permission, never>]?: boolean
}

export type PermissionInsertType = Omit<
  Permission,
  keyof PermissionRelationType | keyof Pick<Permission, 'id'>
>

export type PermissionUpdateType = {
  [K in Exclude<keyof Permission, keyof PermissionRelationType | keyof Pick<Permission, 'id'>>]:
  | Permission[K]
  | (() => string)
}

export type PermissionSortType = {
  [P in keyof Pick<Permission, 'id'>]?: 'ASC' | 'DESC'
}
