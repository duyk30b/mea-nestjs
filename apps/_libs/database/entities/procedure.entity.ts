import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Position from './position.entity'
import ProcedureGroup from './procedure-group.entity'

export enum ProcedureType {
  Basic = 1,
  Regimen = 2, // Liệu trình
  Remedy = 3, // Bài thuốc
}

@Entity('Procedure')
export default class Procedure {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string // Tên dịch vụ

  @Column({ type: 'smallint', default: ProcedureType.Basic })
  @Expose()
  procedureType: ProcedureType

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  quantityDefault: number

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  gapHours: number

  @Expose()
  @Column({ default: 0 })
  procedureGroupId: number

  @Column({ nullable: true })
  @Expose()
  price: number // Giá mặc định

  @Column({ type: 'text', default: JSON.stringify([]) })
  @Expose()
  consumablesHint: string

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isActive: 0 | 1

  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  updatedAt: number

  @ManyToOne((type) => ProcedureGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'procedureGroupId', referencedColumnName: 'id' })
  @Expose()
  procedureGroup: ProcedureGroup

  @Expose()
  positionList: Position[]

  static fromRaw(raw: { [P in keyof Procedure]: any }) {
    if (!raw) return null
    const entity = new Procedure()
    Object.assign(entity, raw)

    entity.price = Number(raw.price)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Procedure]: any }[]) {
    return raws.map((i) => Procedure.fromRaw(i))
  }
}

export type ProcedureRelationType = {
  [P in keyof Pick<Procedure, 'procedureGroup' | 'positionList'>]?: boolean
}

export type ProcedureInsertType = Omit<
  Procedure,
  keyof ProcedureRelationType | keyof Pick<Procedure, 'id' | 'updatedAt'>
>

export type ProcedureUpdateType = {
  [K in Exclude<
    keyof Procedure,
    keyof ProcedureRelationType | keyof Pick<Procedure, 'oid' | 'id' | 'updatedAt'>
  >]: Procedure[K] | (() => string)
}

export type ProcedureSortType = {
  [P in keyof Pick<Procedure, 'oid' | 'id' | 'name' | 'price'>]?: 'ASC' | 'DESC'
}
