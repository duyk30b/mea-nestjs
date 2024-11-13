import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export enum SettingKey {
  SYSTEM_SETTING = 'SYSTEM_SETTING',
  GOOGLE_DRIVER = 'GOOGLE_DRIVER',

  PRODUCT_UNIT = 'PRODUCT_UNIT',
  PRODUCT_ROUTE = 'PRODUCT_ROUTE',
  PRODUCT_HINT_USAGE = 'PRODUCT_HINT_USAGE',

  INVOICE_SURCHARGE_DETAIL = 'INVOICE_SURCHARGE_DETAIL',
  INVOICE_EXPENSE_DETAIL = 'INVOICE_EXPENSE_DETAIL',

  SCREEN_PRODUCT_LIST = 'SCREEN_PRODUCT_LIST',
  SCREEN_PRODUCT_DETAIL = 'SCREEN_PRODUCT_DETAIL',
  SCREEN_PRODUCT_UPSERT = 'SCREEN_PRODUCT_UPSERT',

  SCREEN_RECEIPT_LIST = 'SCREEN_RECEIPT_LIST',
  SCREEN_RECEIPT_DETAIL = 'SCREEN_RECEIPT_DETAIL',
  SCREEN_RECEIPT_UPSERT = 'SCREEN_RECEIPT_UPSERT',

  SCREEN_TICKET_ORDER_LIST = 'SCREEN_TICKET_ORDER_LIST',
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

  SCREEN_APPOINTMENT_LIST = 'SCREEN_APPOINTMENT_LIST',
  TICKET_CLINIC_DETAIL = 'TICKET_CLINIC_DETAIL',
}

@Entity('Setting')
@Index('IDX_Setting__oid_key', ['oid', 'key'], { unique: true })
export default class Setting {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  key: SettingKey

  @Column({ type: 'text' })
  @Expose()
  data: string // Dạng JSON

  static fromRaw(raw: { [P in keyof Setting]: any }) {
    if (!raw) return null
    const entity = new Setting()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Setting]: any }[]) {
    return raws.map((i) => Setting.fromRaw(i))
  }
}

export type SettingRelationType = Pick<Setting, never>

export type SettingSortType = Pick<Setting, 'id'>

export type SettingInsertType = Omit<Setting, keyof SettingRelationType | keyof Pick<Setting, 'id'>>

export type SettingUpdateType = Omit<
  Setting,
  keyof SettingRelationType | keyof Pick<Setting, 'id' | 'oid'>
>
