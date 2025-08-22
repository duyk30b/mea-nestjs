import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import Discount from './discount.entity'
import Position from './position.entity'
import ProcedureGroup from './procedure-group.entity'

export enum ProcedureType {
  Basic = 1,
  SingleProcess = 2,
  Regimen = 3, // Liệu trình
}

@Entity('Procedure')
@Unique('UNIQUE_Procedure__oid_code', ['oid', 'code'])
export default class Procedure {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  code: string // Mã dịch vụ

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Expose()
  @Column({ default: 0 })
  procedureGroupId: number

  @Column({ type: 'smallint', default: ProcedureType.Basic })
  @Expose()
  procedureType: ProcedureType

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  totalSessions: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  gapHours: number

  @Column({ type: 'smallint', default: 24 })
  @Expose()
  gapHoursType: number

  @Column({ default: 0 })
  @Expose()
  price: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  @ManyToOne((type) => ProcedureGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'procedureGroupId', referencedColumnName: 'id' })
  @Expose()
  procedureGroup: ProcedureGroup

  @Expose()
  positionList: Position[]

  @Expose()
  discountList: Discount[]

  @Expose()
  discountListExtra: Discount[]

  static fromRaw(raw: { [P in keyof Procedure]: any }) {
    if (!raw) return null
    const entity = new Procedure()
    Object.assign(entity, raw)

    entity.price = Number(raw.price)

    return entity
  }

  static fromRaws(raws: { [P in keyof Procedure]: any }[]) {
    return raws.map((i) => Procedure.fromRaw(i))
  }
}

export type ProcedureRelationType = {
  [P in keyof Pick<
    Procedure,
    'procedureGroup' | 'positionList' | 'discountList' | 'discountListExtra'
  >]?: boolean
}

export type ProcedureInsertType = Omit<
  Procedure,
  keyof ProcedureRelationType | keyof Pick<Procedure, 'id'>
>

export type ProcedureUpdateType = {
  [K in Exclude<
    keyof Procedure,
    keyof ProcedureRelationType | keyof Pick<Procedure, 'oid' | 'id'>
  >]: Procedure[K] | (() => string)
}

export type ProcedureSortType = {
  [P in keyof Pick<Procedure, 'oid' | 'id' | 'code' | 'name'>]?: 'ASC' | 'DESC'
}
