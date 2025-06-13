import { Exclude, Expose } from 'class-transformer'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import Discount from './discount.entity'
import LaboratoryGroup from './laboratory-group.entity'
import Position from './position.entity'
import TicketLaboratory from './ticket-laboratory.entity'

export enum LaboratoryValueType {
  Number = 1,
  String = 2,
  Options = 3,
  Children = 4,
}
@Entity('Laboratory')
@Index('IDX_Laboratory__oid_parentId', ['oid', 'parentId'])
@Unique('UNIQUE_Laboratory__oid_laboratoryCode', ['oid', 'laboratoryCode'])
export default class Laboratory {
  @Exclude()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  laboratoryCode: string

  @Column({ default: 1 })
  @Expose()
  priority: number // Sắp xết thứ tự các xét nghiệm trong phiếu

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Expose()
  @Column({ default: 0 })
  laboratoryGroupId: number

  @Column({ default: 0 })
  @Expose()
  costPrice: number // Giá vốn

  @Column({ nullable: true })
  @Expose()
  price: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  level: number

  @Column({ default: 0 })
  @Expose()
  parentId: number

  @Expose()
  @Column({ type: 'smallint', default: LaboratoryValueType.Number })
  valueType: LaboratoryValueType

  @Column({ type: 'varchar', length: 25 })
  @Expose()
  unit: string

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  lowValue: number

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  highValue: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  options: string

  @ManyToOne((type) => LaboratoryGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'laboratoryGroupId', referencedColumnName: 'id' })
  @Expose()
  laboratoryGroup: LaboratoryGroup

  @Expose()
  @ManyToOne((type) => TicketLaboratory, (ticketLaboratory) => ticketLaboratory.laboratoryList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'parentId', referencedColumnName: 'laboratoryId' })
  ticketLaboratory: TicketLaboratory

  @Expose()
  children: Laboratory[]

  @Expose()
  positionList: Position[]

  @Expose()
  discountList: Discount[]

  @Expose()
  discountListExtra: Discount[]

  static fromRaw(raw: { [P in keyof Laboratory]: any }) {
    if (!raw) return null
    const entity = new Laboratory()

    entity.costPrice = Number(raw.costPrice)
    entity.price = Number(raw.price)
    entity.lowValue = Number(raw.lowValue)
    entity.highValue = Number(raw.highValue)

    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Laboratory]: any }[]) {
    return raws.map((i) => Laboratory.fromRaw(i))
  }
}

export type LaboratoryRelationType = {
  [P in keyof Pick<
    Laboratory,
    | 'laboratoryGroup'
    | 'children'
    | 'ticketLaboratory'
    | 'positionList'
    | 'discountList'
    | 'discountListExtra'
  >]?: boolean
}

export type LaboratoryInsertType = Omit<
  Laboratory,
  keyof LaboratoryRelationType | keyof Pick<Laboratory, 'id'>
>

export type LaboratoryUpdateType = {
  [K in Exclude<
    keyof Laboratory,
    keyof LaboratoryRelationType | keyof Pick<Laboratory, 'oid' | 'id'>
  >]: Laboratory[K] | (() => string)
}

export type LaboratorySortType = {
  [P in keyof Pick<
    Laboratory,
    'oid' | 'id' | 'laboratoryCode' | 'priority' | 'name' | 'laboratoryGroupId'
  >]?: 'ASC' | 'DESC'
}

export type LaboratoryChildUpdateType = Omit<
  Laboratory,
  | keyof LaboratoryRelationType
  | keyof Pick<Laboratory, 'oid' | 'parentId' | 'level' | 'laboratoryGroupId'>
>
