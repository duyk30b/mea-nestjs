import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum PermissionStatus {
  BLOCK = -1,
  NORMAL = 0,
  PUBLIC = 1,
}

export enum PermissionId {
  USER = 1,
  USER_LIST = 100,
  USER_INSERT = 101,
  USER_UPDATE = 102,
  USER_DELETE = 103,

  PRODUCT = 2,
  PRODUCT_LIST = 200,
  PRODUCT_INSERT = 201,
  PRODUCT_UPDATE = 202,
  PRODUCT_DELETE = 203,

  DISTRIBUTOR = 3,
  DISTRIBUTOR_LIST = 300,
  DISTRIBUTOR_INSERT = 301,
  DISTRIBUTOR_UPDATE = 302,
  DISTRIBUTOR_DELETE = 303,

  CUSTOMER = 4,
  CUSTOMER_LIST = 400,
  CUSTOMER_INSERT = 401,
  CUSTOMER_UPDATE = 402,
  CUSTOMER_DELETE = 403,

  PROCEDURE = 5,
  PROCEDURE_LIST = 500,
  PROCEDURE_INSERT = 501,
  PROCEDURE_UPDATE = 502,
  PROCEDURE_DELETE = 503,

  RECEIPT = 6,
  RECEIPT_LIST = 600,
  RECEIPT_INSERT = 601,
  RECEIPT_UPDATE = 602,
  RECEIPT_DELETE = 603,

  INVOICE = 7,
  INVOICE_LIST = 700,
  INVOICE_INSERT = 701,
  INVOICE_UPDATE = 702,
  INVOICE_DELETE = 703,

  STATISTIC = 8,
  STATISTIC_PRODUCT = 800,
  STATISTIC_PROCEDURE = 801,
  STATISTIC_CUSTOMER = 802,
  STATISTIC_INVOICE = 803,
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
  parentId: PermissionId

  @Column({ type: 'smallint', default: PermissionStatus.NORMAL })
  @Expose()
  status: PermissionStatus

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  pathId: string
}

export type PermissionInsertType = Omit<Permission, ''>
export type PermissionUpdateType = Omit<Permission, 'id'>
