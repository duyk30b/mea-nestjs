import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { CommissionCalculatorType, PositionInteractType } from './position.entity'
import Role from './role.entity'
import Ticket from './ticket.entity'
import User from './user.entity'

@Entity('TicketUser')
@Index('IDX_TicketUser__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketUser__oid_createdAt', ['oid', 'createdAt'])
export default class TicketUser {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column()
  @Expose()
  ticketId: number

  @Column({ default: 0 })
  @Expose()
  roleId: number

  @Column()
  @Expose()
  userId: number

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  positionType: PositionInteractType

  @Column({ type: 'integer', default: 0 })
  @Expose()
  positionInteractId: number // procedureId hoặc productId hoặc radiologyId

  @Column({ type: 'integer', default: 0 })
  @Expose()
  ticketItemId: number // ticketProcedureId hoặc ticketProductId hoặc ticketRadiologyId

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
    precision: 5,
    scale: 3,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  commissionPercentActual: number // % giảm giá

  @Column({
    type: 'decimal',
    default: 0,
    precision: 5,
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

  static changeTicketItemMoney(
    ticketUserOrigin: TicketUser,
    ticketItem: { quantity: number; expectedPrice: number; actualPrice: number }
  ) {
    const quantity = ticketItem.quantity
    const ticketItemExpectedPrice = ticketItem.expectedPrice
    const ticketItemActualPrice = ticketItem.actualPrice

    let commissionMoney = 0
    let commissionPercentActual = 0
    let commissionPercentExpected = 0

    if (ticketUserOrigin.commissionCalculatorType === CommissionCalculatorType.VND) {
      commissionMoney = ticketUserOrigin.commissionMoney
      commissionPercentExpected =
        ticketItemExpectedPrice === 0
          ? 0
          : Math.floor((commissionMoney * 100) / ticketItemExpectedPrice)
      commissionPercentActual =
        ticketItemActualPrice === 0
          ? 0
          : Math.floor((commissionMoney * 100) / ticketItemActualPrice)
    }
    if (ticketUserOrigin.commissionCalculatorType === CommissionCalculatorType.PercentExpected) {
      commissionPercentExpected = ticketUserOrigin.commissionPercentExpected || 0
      commissionMoney = Math.floor((ticketItemExpectedPrice * commissionPercentExpected) / 100)
      commissionPercentActual =
        ticketItemActualPrice === 0
          ? 0
          : Math.floor((commissionMoney * 100) / ticketItemActualPrice)
    }
    if (ticketUserOrigin.commissionCalculatorType === CommissionCalculatorType.PercentActual) {
      commissionPercentActual = ticketUserOrigin.commissionPercentActual || 0
      commissionMoney = Math.floor((ticketItem.actualPrice * commissionPercentActual) / 100)
      commissionPercentExpected =
        ticketItemExpectedPrice === 0
          ? 0
          : Math.floor((commissionMoney * 100) / ticketItemExpectedPrice)
    }

    const ticketUserFix = TicketUser.fromRaw(ticketUserOrigin)
    ticketUserFix.quantity = quantity
    ticketUserFix.ticketItemExpectedPrice = ticketItemExpectedPrice
    ticketUserFix.ticketItemActualPrice = ticketItemActualPrice
    ticketUserFix.commissionMoney = commissionMoney
    ticketUserFix.commissionPercentActual = commissionPercentActual
    ticketUserFix.commissionPercentExpected = commissionPercentExpected
    return ticketUserFix
  }
}

export type TicketUserRelationType = {
  [P in keyof Pick<TicketUser, 'ticket' | 'user' | 'role'>]?: boolean
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
  [P in keyof Pick<TicketUser, 'oid' | 'id' | 'createdAt' | 'positionType' | 'roleId'>]?:
  | 'ASC'
  | 'DESC'
}
