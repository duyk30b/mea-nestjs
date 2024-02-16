import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export enum ScreenSettingKey {
  SYSTEM_SETTING = 'SYSTEM_SETTING',

  PRODUCT_GROUP = 'PRODUCT_GROUP',
  PRODUCT_UNIT = 'PRODUCT_UNIT',
  PRODUCT_ROUTE = 'PRODUCT_ROUTE',
  PRODUCT_HINT_USAGE = 'PRODUCT_HINT_USAGE',

  PROCEDURE_GROUP = 'PROCEDURE_GROUP',

  INVOICE_SURCHARGE_DETAIL = 'INVOICE_SURCHARGE_DETAIL',
  INVOICE_EXPENSE_DETAIL = 'INVOICE_EXPENSE_DETAIL',

  SCREEN_PRODUCT_LIST = 'SCREEN_PRODUCT_LIST',
  SCREEN_PRODUCT_DETAIL = 'SCREEN_PRODUCT_DETAIL',
  SCREEN_PRODUCT_UPSERT = 'SCREEN_PRODUCT_UPSERT',

  SCREEN_RECEIPT_LIST = 'SCREEN_RECEIPT_LIST',
  SCREEN_RECEIPT_DETAIL = 'SCREEN_RECEIPT_DETAIL',
  SCREEN_RECEIPT_UPSERT = 'SCREEN_RECEIPT_UPSERT',

  SCREEN_INVOICE_LIST = 'SCREEN_INVOICE_LIST',
  SCREEN_INVOICE_DETAIL = 'SCREEN_INVOICE_DETAIL',
  SCREEN_INVOICE_PREVIEW = 'SCREEN_INVOICE_PREVIEW',
  SCREEN_INVOICE_UPSERT = 'SCREEN_INVOICE_UPSERT',

  SCREEN_CUSTOMER_LIST = 'SCREEN_CUSTOMER_LIST',
  SCREEN_CUSTOMER_DETAIL = 'SCREEN_CUSTOMER_DETAIL',
  SCREEN_CUSTOMER_UPSERT = 'SCREEN_CUSTOMER_UPSERT',

  SCREEN_DISTRIBUTOR_LIST = 'SCREEN_DISTRIBUTOR_LIST',
  SCREEN_DISTRIBUTOR_DETAIL = 'SCREEN_DISTRIBUTOR_DETAIL',
  SCREEN_DISTRIBUTOR_UPSERT = 'SCREEN_DISTRIBUTOR_UPSERT',

  SCREEN_PROCEDURE_LIST = 'SCREEN_PROCEDURE_LIST',
  SCREEN_PROCEDURE_DETAIL = 'SCREEN_PROCEDURE_DETAIL',
  SCREEN_PROCEDURE_UPSERT = 'SCREEN_PROCEDURE_UPSERT',
}

@Entity('OrganizationSetting')
@Index('IDX_OrganizationSetting__type', ['oid', 'type'], { unique: true })
export default class OrganizationSetting {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ type: 'character varying', length: 255 })
  @Expose({ name: 'type' })
  type: ScreenSettingKey

  @Column({ name: 'data', type: 'text' })
  @Expose({ name: 'data' })
  data: string // Dạng JSON
}

export type OrganizationSettingInsertType = Omit<OrganizationSetting, 'id' | 'users'>
export type OrganizationSettingUpdateType = Omit<OrganizationSetting, 'id' | 'oid'>
