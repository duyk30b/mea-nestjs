import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import { DiscountType } from '../common/variable'
import Role from './role.entity'
import Ticket from './ticket.entity'
import User from './user.entity'

export enum TicketUserReferenceType {
  Ticket = 1,
  TicketProcedure = 2,
  TicketProduct = 3,
  TicketRadiology = 4,
}

@Entity('TicketUser')
@Index('IDX_TicketUser__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketUser__oid_createdAt', ['oid', 'createdAt'])
export default class TicketUser extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column()
  @Expose()
  userId: number

  @Column()
  @Expose()
  referenceId: number // ticketProcedureId hoặc ticketProductId hoặc ticketRadiologyId

  @Column({ default: 0 })
  @Expose()
  referenceType: TicketUserReferenceType

  @Column({ default: 0 })
  @Expose()
  roleId: number

  @Column({ default: 0 })
  @Expose()
  bolusMoney: number

  @Column({ default: 0 })
  @Expose()
  bolusPercent: number

  @Column({ type: 'varchar', length: 25, default: DiscountType.VND })
  @Expose()
  bolusType: DiscountType

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

    entity.createdAt = Number(raw.createdAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketUser]: any }[]) {
    return raws.map((i) => TicketUser.fromRaw(i))
  }
}

export type TicketUserRelationType = Pick<TicketUser, 'user' | 'ticket' | 'role'>

export type TicketUserSortType = Pick<TicketUser, 'id' | 'createdAt'>

export type TicketUserInsertType = Omit<
  TicketUser,
  keyof TicketUserRelationType | keyof Pick<TicketUser, 'id'>
>

export type TicketUserUpdateType = Omit<
  TicketUser,
  keyof TicketUserRelationType | keyof Pick<TicketUser, 'oid' | 'id'>
>
