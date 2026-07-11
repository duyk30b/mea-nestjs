import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('PrintSetting')
export default class PrintSetting {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ default: 0 })
  templateHtmlType: number

  @Expose()
  @Column({ default: 0 })
  templateHtmlId: number

  static fromRaw(raw: { [P in keyof PrintSetting]: any }) {
    if (!raw) return null
    const entity = new PrintSetting()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof PrintSetting]: any }[]) {
    return raws.map((i) => PrintSetting.fromRaw(i))
  }
}

export type PrintSettingRelationType = {
  [P in keyof Pick<PrintSetting, never>]?: boolean
}

export type PrintSettingInsertType = Omit<
  PrintSetting,
  keyof PrintSettingRelationType | keyof Pick<PrintSetting, 'id'>
>

export type PrintSettingUpdateType = {
  [K in Exclude<
    keyof PrintSetting,
    keyof PrintSettingRelationType | keyof Pick<PrintSetting, 'oid' | 'id'>
  >]: PrintSetting[K] | (() => string)
}

export type PrintSettingSortType = {
  [P in keyof Pick<PrintSetting, 'id'>]?: 'ASC' | 'DESC'
}
