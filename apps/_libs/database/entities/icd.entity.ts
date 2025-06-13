import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('ICD')
export default class ICD {
  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ length: 25, default: '' })
  @Expose()
  code: string

  @Column({ type: 'varchar', default: '' })
  @Expose()
  name: string

  static fromRaw(raw: { [P in keyof ICD]: any }) {
    if (!raw) return null
    const entity = new ICD()
    Object.assign(entity, raw)
    return entity
  }

  static fromRaws(raws: { [P in keyof ICD]: any }[]) {
    return raws.map((i) => ICD.fromRaw(i))
  }
}

export type ICDRelationType = {
  [P in keyof Pick<ICD, never>]?: boolean
}

export type ICDInsertType = Omit<
  ICD,
  | keyof ICDRelationType
  | keyof Pick<ICD, 'id'>
>

export type ICDUpdateType = {
  [K in Exclude<
    keyof ICD,
    | keyof ICDRelationType
    | keyof Pick<ICD, 'id'>
  >]: ICD[K] | (() => string)
}

export type ICDSortType = {
  [P in keyof Pick<ICD, 'id'>]?: 'ASC' | 'DESC'
}
