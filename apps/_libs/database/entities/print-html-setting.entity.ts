import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('PrintHtmlSetting')
export default class PrintHtmlSetting {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ default: 0 })
  printHtmlType: number

  @Expose()
  @Column({ default: 0 })
  printHtmlId: number

  static fromRaw(raw: { [P in keyof PrintHtmlSetting]: any }) {
    if (!raw) return null
    const entity = new PrintHtmlSetting()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof PrintHtmlSetting]: any }[]) {
    return raws.map((i) => PrintHtmlSetting.fromRaw(i))
  }
}

export type PrintHtmlSettingRelationType = {
  [P in keyof Pick<PrintHtmlSetting, never>]?: boolean
}

export type PrintHtmlSettingInsertType = Omit<
  PrintHtmlSetting,
  keyof PrintHtmlSettingRelationType | keyof Pick<PrintHtmlSetting, 'id'>
>

export type PrintHtmlSettingUpdateType = {
  [K in Exclude<
    keyof PrintHtmlSetting,
    keyof PrintHtmlSettingRelationType | keyof Pick<PrintHtmlSetting, 'oid' | 'id'>
  >]: PrintHtmlSetting[K] | (() => string)
}

export type PrintHtmlSettingSortType = {
  [P in keyof Pick<PrintHtmlSetting, 'id'>]?: 'ASC' | 'DESC'
}
