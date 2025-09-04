import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import LaboratoryGroup from './laboratory-group.entity'
import Laboratory from './laboratory.entity'
import Procedure from './procedure.entity'
import Product from './product.entity'
import Radiology from './radiology.entity'
import Role from './role.entity'

export enum PositionType {
  TicketReception = 1,
  ProductRequest = 2,
  TicketPrescriptionRequest = 3,
  ProcedureRequest = 4,
  ProcedureResult = 5,
  LaboratoryRequest = 6,
  LaboratoryGroupRequest = 7,
  LaboratoryGroupResult = 8,
  RadiologyRequest = 9,
  RadiologyResult = 10,
}

export enum CommissionCalculatorType {
  VND = 1,
  PercentExpected = 2,
  PercentActual = 3,
}

@Entity('Position')
export default class Position {
  @Column()
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn()
  @Expose()
  id: number

  @Column({ type: 'integer', default: 0 })
  @Expose()
  priority: number

  @Column()
  @Expose()
  roleId: number

  @Column({ type: 'integer', default: 0 })
  @Expose()
  positionInteractId: number

  @Column({ type: 'smallint', default: PositionType.TicketReception })
  @Expose()
  positionType: PositionType

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
  productRequest: Product

  @Expose()
  procedureRequest: Procedure

  @Expose()
  procedureResult: Procedure

  @Expose()
  laboratoryRequest: Laboratory

  @Expose()
  laboratoryGroupRequest: LaboratoryGroup

  @Expose()
  laboratoryGroupResult: LaboratoryGroup

  @Expose()
  radiologyRequest: Radiology

  @Expose()
  radiologyResult: Radiology

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
    | 'role'
    | 'productRequest'
    | 'procedureRequest'
    | 'procedureResult'
    | 'laboratoryRequest'
    | 'laboratoryGroupRequest'
    | 'laboratoryGroupResult'
    | 'radiologyRequest'
    | 'radiologyResult'
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
