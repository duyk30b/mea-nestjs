import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('Surcharge')
@Unique('UNIQUE_Surcharge__oid_code', ['oid', 'code'])
export default class Surcharge {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  code: string

  @Column()
  @Expose()
  name: string

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  static fromRaw(raw: { [P in keyof Surcharge]: any }) {
    if (!raw) return null
    const entity = new Surcharge()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Surcharge]: any }[]) {
    return raws.map((i) => Surcharge.fromRaw(i))
  }
}

export type SurchargeRelationType = {
  [P in keyof Pick<Surcharge, never>]?: boolean
}

export type SurchargeInsertType = Omit<
  Surcharge,
  keyof SurchargeRelationType | keyof Pick<Surcharge, 'id'>
>

export type SurchargeUpdateType = {
  [K in Exclude<
    keyof Surcharge,
    keyof SurchargeRelationType | keyof Pick<Surcharge, 'oid' | 'id'>
  >]: Surcharge[K] | (() => string)
}

export type SurchargeSortType = {
  [P in keyof Pick<Surcharge, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
