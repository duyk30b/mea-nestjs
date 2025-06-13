import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('RadiologySample')
export default class RadiologySample {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ default: 0 })
  priority: number

  @Expose()
  @Column({ default: 0 })
  userId: number

  @Expose()
  @Column({ default: 0 })
  radiologyId: number

  @Expose()
  @Column({ default: 0 })
  printHtmlId: number

  @Expose()
  @Column({ type: 'varchar', length: 255, default: '' })
  name: string

  @Column({ type: 'text', default: '' })
  @Expose()
  description: string

  @Column({ type: 'varchar', length: 255, default: '' })
  @Expose()
  result: string

  @Column({ type: 'text', default: '' })
  @Expose()
  customStyles: string // Dạng Style

  @Column({ type: 'text', default: '' })
  @Expose()
  customVariables: string // Dạng Javascript

  static fromRaw(raw: { [P in keyof RadiologySample]: any }) {
    if (!raw) return null
    const entity = new RadiologySample()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof RadiologySample]: any }[]) {
    return raws.map((i) => RadiologySample.fromRaw(i))
  }
}

export type RadiologySampleRelationType = {
  [P in keyof Pick<RadiologySample, never>]?: boolean
}

export type RadiologySampleInsertType = Omit<
  RadiologySample,
  keyof RadiologySampleRelationType | keyof Pick<RadiologySample, 'id'>
>

export type RadiologySampleUpdateType = {
  [K in Exclude<
    keyof RadiologySample,
    keyof RadiologySampleRelationType | keyof Pick<RadiologySample, 'oid' | 'id'>
  >]: RadiologySample[K] | (() => string)
}

export type RadiologySampleSortType = {
  [P in keyof Pick<RadiologySample, 'oid' | 'id' | 'userId' | 'priority' | 'radiologyId'>]?:
  | 'ASC'
  | 'DESC'
}
