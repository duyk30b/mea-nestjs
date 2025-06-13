import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import Product from './product.entity'

export type ProductSettingRule = Pick<
  Product,
  | 'splitBatchByWarehouse'
  | 'splitBatchByDistributor'
  | 'splitBatchByExpiryDate'
  | 'splitBatchByCostPrice'
> & {
  allowNegativeQuantity: boolean
}

export enum SettingKey {
  ROOT_SETTING = 'ROOT_SETTING',
  SYSTEM_SETTING = 'SYSTEM_SETTING',
  GOOGLE_DRIVER = 'GOOGLE_DRIVER',
  PRODUCT_SETTING = 'PRODUCT_SETTING',
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

export type SettingRelationType = {
  [P in keyof Pick<Setting, never>]?: boolean
}

export type SettingInsertType = Omit<Setting, keyof SettingRelationType | keyof Pick<Setting, 'id'>>

export type SettingUpdateType = {
  [K in Exclude<keyof Setting, keyof SettingRelationType | keyof Pick<Setting, 'oid' | 'id'>>]:
  | Setting[K]
  | (() => string)
}

export type SettingSortType = {
  [P in keyof Pick<Setting, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
