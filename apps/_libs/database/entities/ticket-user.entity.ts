import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import LaboratoryGroup from './laboratory-group.entity'
import Laboratory from './laboratory.entity'
import Position, { CommissionCalculatorType, PositionType } from './position.entity'
import Procedure from './procedure.entity'
import Product from './product.entity'
import Radiology from './radiology.entity'
import Regimen from './regimen.entity'
import Role from './role.entity'
import Ticket from './ticket.entity'
import User from './user.entity'

@Entity('TicketUser')
@Index('IDX_TicketUser__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketUser__oid_createdAt', ['oid', 'createdAt'])
export default class TicketUser {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column({ default: 0 })
  @Expose()
  positionId: number

  @Column({ default: 0 })
  @Expose()
  roleId: number

  @Column()
  @Expose()
  userId: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  positionType: PositionType

  @Column({ type: 'integer', default: 0 })
  @Expose()
  positionInteractId: number // procedureId hoặc productId hoặc radiologyId

  @Column({ type: 'bigint', default: 0 })
  @Expose()
  ticketItemId: string // ticketProcedureId hoặc ticketProductId hoặc ticketRadiologyId

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  ticketItemExpectedPrice: number // Giá dự kiến

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  ticketItemActualPrice: number // Giá thực tế

  @Column({ type: 'integer', default: 1 })
  @Expose()
  quantity: number

  @Column({ type: 'smallint', default: 1 }) // TODO TODO ...
  @Expose()
  commissionCalculatorType: CommissionCalculatorType

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  commissionMoney: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  commissionPercentActual: number // % giảm giá

  @Column({
    type: 'decimal',
    default: 0,
    precision: 7,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  commissionPercentExpected: number // % giảm giá

  @Column({
    type: 'bigint',
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  createdAt: number

  @Expose()
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketUserList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  @Expose()
  @ManyToOne((type) => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User

  @Expose()
  @ManyToOne((type) => Role, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
  role: Role

  @Expose()
  position: Position

  @Expose()
  product: Product

  @Expose()
  procedure: Procedure

  @Expose()
  regimen: Regimen

  @Expose()
  laboratory: Laboratory

  @Expose()
  laboratoryGroup: LaboratoryGroup

  @Expose()
  radiology: Radiology

  static fromRaw(raw: { [P in keyof TicketUser]: any }) {
    if (!raw) return null
    const entity = new TicketUser()
    Object.assign(entity, raw)

    entity.commissionMoney = Number(raw.commissionMoney)
    entity.commissionPercentActual = Number(raw.commissionPercentActual)
    entity.commissionPercentExpected = Number(raw.commissionPercentExpected)
    entity.ticketItemExpectedPrice = Number(raw.ticketItemExpectedPrice)
    entity.ticketItemActualPrice = Number(raw.ticketItemActualPrice)
    entity.createdAt = Number(raw.createdAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketUser]: any }[]) {
    return raws.map((i) => TicketUser.fromRaw(i))
  }

  static reCalculatorCommission(ticketUser: TicketUser) {
    if (ticketUser.commissionCalculatorType === CommissionCalculatorType.VND) {
      ticketUser.commissionMoney = ticketUser.commissionMoney || 0
      ticketUser.commissionPercentExpected =
        ticketUser.ticketItemExpectedPrice == 0
          ? 0
          : Math.floor((ticketUser.commissionMoney * 100) / ticketUser.ticketItemExpectedPrice)
      ticketUser.commissionPercentActual =
        ticketUser.ticketItemActualPrice === 0
          ? 0
          : Math.floor((ticketUser.commissionMoney * 100) / ticketUser.ticketItemActualPrice)
    }
    if (ticketUser.commissionCalculatorType === CommissionCalculatorType.PercentExpected) {
      ticketUser.commissionPercentExpected = ticketUser.commissionPercentExpected || 0
      ticketUser.commissionMoney = Math.floor(
        (ticketUser.ticketItemExpectedPrice * ticketUser.commissionPercentExpected) / 100
      )
      ticketUser.commissionPercentActual =
        ticketUser.ticketItemActualPrice === 0
          ? 0
          : Math.floor((ticketUser.commissionMoney * 100) / ticketUser.ticketItemActualPrice)
    }
    if (ticketUser.commissionCalculatorType === CommissionCalculatorType.PercentActual) {
      ticketUser.commissionPercentActual = ticketUser.commissionPercentActual || 0
      ticketUser.commissionMoney = Math.floor(
        (ticketUser.ticketItemActualPrice * ticketUser.commissionPercentActual) / 100
      )
      ticketUser.commissionPercentExpected =
        ticketUser.ticketItemExpectedPrice === 0
          ? 0
          : Math.floor((ticketUser.commissionMoney * 100) / ticketUser.ticketItemExpectedPrice)
    }
  }
}

export type TicketUserRelationType = {
  [P in keyof Pick<
    TicketUser,
    | 'ticket'
    | 'user'
    | 'role'
    | 'position'
    | 'product'
    | 'procedure'
    | 'regimen'
    | 'laboratory'
    | 'laboratoryGroup'
    | 'radiology'
  >]?: boolean
}

export type TicketUserInsertType = Omit<
  TicketUser,
  keyof TicketUserRelationType | keyof Pick<TicketUser, 'id'>
>

export type TicketUserUpdateType = {
  [K in Exclude<
    keyof TicketUser,
    keyof TicketUserRelationType | keyof Pick<TicketUser, 'oid' | 'id'>
  >]: TicketUser[K] | (() => string)
}

export type TicketUserUpsertType = Omit<TicketUser, keyof TicketUserRelationType>

export type TicketUserSortType = {
  [P in keyof Pick<
    TicketUser,
    'oid' | 'id' | 'createdAt' | 'positionType' | 'ticketItemId' | 'roleId'
  >]?: 'ASC' | 'DESC'
}
