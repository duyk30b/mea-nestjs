import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Laboratory from './laboratory.entity'
import Procedure from './procedure.entity'
import Product from './product.entity'
import Radiology from './radiology.entity'
import Role from './role.entity'

export enum PositionInteractType {
  Ticket = 1,
  Product = 2, // chỉ tương tác với sản phẩm
  Procedure = 3, // chỉ tương tác với thủ thuật
  Radiology = 4, // chỉ tương tác với phiếu CĐHA (1 phiếu 1 CHA)
  Laboratory = 5, // chỉ tương tác với 1 xét nghiệm
  Regimen = 6, // chỉ tương tác với 1 xét nghiệm
  ConsumableList = 7, // tương tác với tất cả sản phẩm trong cả tiêu hao
  PrescriptionList = 8, // tương tác với tất cả sản phẩm trong cả toa thuốc
  LaboratoryGroup = 9, // chỉ tương tác với phiếu xét nghiệm (1 phiếu nhiều xét nghiệm)
}

export enum CommissionCalculatorType {
  VND = 1,
  PercentExpected = 2,
  PercentActual = 3,
}

@Entity('Position')
@Index(
  'IDX_Position__oid_roleId_positionType_positionInteractId',
  ['oid', 'roleId', 'positionType', 'positionInteractId'],
  { unique: true }
)
export default class Position {
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
  positionInteractId: number

  @Column({ type: 'smallint', default: PositionInteractType.Ticket })
  @Expose()
  positionType: PositionInteractType

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

  static fromRaw(raw: { [P in keyof Position]: any }) {
    if (!raw) return null
    const entity = new Position()
    Object.assign(entity, raw)

    entity.commissionValue = Number(raw.commissionValue)
    return entity
  }

  static fromRaws(raws: { [P in keyof Position]: any }[]) {
    return raws.map((i) => Position.fromRaw(i))
  }
}

export type PositionRelationType = {
  [P in keyof Pick<
    Position,
    'role' | 'product' | 'procedure' | 'radiology' | 'laboratory'
  >]?: boolean
}

export type PositionInsertType = Omit<
  Position,
  keyof PositionRelationType | keyof Pick<Position, 'id'>
>

export type PositionUpdateType = {
  [K in Exclude<keyof Position, keyof PositionRelationType | keyof Pick<Position, 'oid' | 'id'>>]:
  | Position[K]
  | (() => string)
}

export type PositionSortType = {
  [P in keyof Pick<Position, 'oid' | 'id' | 'positionType' | 'roleId'>]?: 'ASC' | 'DESC'
}
