import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export enum SettingKey {
  ROOT_SETTING = 'ROOT_SETTING',
  SYSTEM_SETTING = 'SYSTEM_SETTING',
  GOOGLE_DRIVER = 'GOOGLE_DRIVER',
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
