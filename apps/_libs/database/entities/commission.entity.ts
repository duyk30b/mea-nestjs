import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Role from './role.entity'

export enum RoleInteractType {
  Ticket = 1,
  Product = 2,
  Procedure = 3,
  Radiology = 4,
  Laboratory = 5,
}

export enum CommissionCalculatorType {
  VND = 1,
  PercentRetail = 2,
  PercentActual = 3,
}

@Entity('Commission')
@Index('IDX_Setting__oid_roleId_interactType_interactId', ['oid', 'roleId', 'interactType', 'interactId'], { unique: true })
export default class Commission {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column()
  @Expose()
  roleId: number

  @Column({ type: 'integer' })
  @Expose()
  interactId: number

  @Column({ type: 'smallint', default: RoleInteractType.Ticket })
  @Expose()
  interactType: RoleInteractType

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  value: number

  @Column({ type: 'smallint', default: CommissionCalculatorType.VND })
  @Expose()
  calculatorType: CommissionCalculatorType

  @Expose()
  @ManyToOne((type) => Role, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
  role: Role

  static fromRaw(raw: { [P in keyof Commission]: any }) {
    if (!raw) return null
    const entity = new Commission()
    Object.assign(entity, raw)

    entity.value = Number(raw.value)
    return entity
  }

  static fromRaws(raws: { [P in keyof Commission]: any }[]) {
    return raws.map((i) => Commission.fromRaw(i))
  }
}

export type CommissionRelationType = {
  [P in keyof Pick<Commission, 'role'>]?: boolean
}

export type CommissionInsertType = Omit<
  Commission,
  keyof CommissionRelationType | keyof Pick<Commission, 'id'>
>

export type CommissionUpdateType = {
  [K in Exclude<
    keyof Commission,
    keyof CommissionRelationType | keyof Pick<Commission, 'oid' | 'id'>
  >]: Commission[K] | (() => string)
}

export type CommissionSortType = {
  [P in keyof Pick<Commission, 'oid' | 'id' | 'interactType' | 'roleId'>]?: 'ASC' | 'DESC'
}
