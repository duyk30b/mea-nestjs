import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum PermissionId {
  ORGANIZATION = 1,
  ORGANIZATION_UPDATE_INFO = 100,
  ORGANIZATION_SETTING_SCREEN = 101,

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

  RECEIPT = 8,
  RECEIPT_READ = 800,
  RECEIPT_CREATE_DRAFT = 801,
  RECEIPT_UPDATE_DRAFT = 802,
  RECEIPT_PREPAYMENT = 803,
  RECEIPT_SHIP = 804,
  RECEIPT_PAY_DEBT = 805,
  RECEIPT_REFUND = 806,
  RECEIPT_DELETE = 807,

  INVOICE = 9,
  INVOICE_READ = 900,
  INVOICE_CREATE_DRAFT = 901,
  INVOICE_UPDATE_DRAFT = 902,
  INVOICE_PREPAYMENT = 903,
  INVOICE_SHIP = 904,
  INVOICE_PAY_DEBT = 905,
  INVOICE_REFUND = 906,
  INVOICE_DELETE = 907,

  STATISTIC = 10,
  STATISTIC_PRODUCT = 1000,
  STATISTIC_PROCEDURE = 1001,
  STATISTIC_CUSTOMER = 1002,
  STATISTIC_RECEIPT = 1003,
  STATISTIC_INVOICE = 1004,

  ARRIVAL = 11,
  ARRIVAL_READ = 1100,
  ARRIVAL_CREATE = 1101,
  ARRIVAL_UPDATE = 1102,
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
}

export type PermissionInsertType = Omit<Permission, ''>
export type PermissionUpdateType = Omit<Permission, 'id'>
