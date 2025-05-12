import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Laboratory from './laboratory.entity'
import Procedure from './procedure.entity'
import Product from './product.entity'
import Radiology from './radiology.entity'
import Role from './role.entity'

export enum InteractType {
  Ticket = 1,
  Product = 2, // chỉ tương tác với sản phẩm
  Procedure = 3, // chỉ tương tác với thủ thuật
  Radiology = 4, // chỉ tương tác với phiếu CĐHA
  Laboratory = 5, // chỉ tương tác với phiếu xét nghiệm
  ConsumableList = 6, // tương tác với tất cả sản phẩm trong cả tiêu hao
  PrescriptionList = 7, // tương tác với tất cả sản phẩm trong cả toa thuốc
}

export enum CommissionCalculatorType {
  VND = 1,
  PercentExpected = 2,
  PercentActual = 3,
}

@Entity('Commission')
@Index(
  'IDX_Commission__oid_roleId_interactType_interactId',
  ['oid', 'roleId', 'interactType', 'interactId'],
  { unique: true }
)
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

  @Column({ type: 'integer', default: 0 })
  @Expose()
  interactId: number

  @Column({ type: 'smallint', default: InteractType.Ticket })
  @Expose()
  interactType: InteractType

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  commissionValue: number

  @Column({ type: 'smallint', default: CommissionCalculatorType.VND })
  @Expose()
  commissionCalculatorType: CommissionCalculatorType

  @Expose()
  @ManyToOne((type) => Role, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
  role: Role

  @Expose()
  product: Product

  @Expose()
  procedure: Procedure

  @Expose()
  radiology: Radiology

  @Expose()
  laboratory: Laboratory

  static fromRaw(raw: { [P in keyof Commission]: any }) {
    if (!raw) return null
    const entity = new Commission()
    Object.assign(entity, raw)

    entity.commissionValue = Number(raw.commissionValue)
    return entity
  }

  static fromRaws(raws: { [P in keyof Commission]: any }[]) {
    return raws.map((i) => Commission.fromRaw(i))
  }
}

export type CommissionRelationType = {
  [P in keyof Pick<
    Commission,
    'role' | 'product' | 'procedure' | 'radiology' | 'laboratory'
  >]?: boolean
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
