import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import {
  CommissionCalculatorType,
  RoleInteractType,
} from './commission.entity'
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

  @Column({ type: 'smallint', default: RoleInteractType.Ticket })
  @Expose()
  interactType: RoleInteractType

  @Column({ type: 'integer', default: 0 })
  @Expose()
  interactId: number  // ticketProcedureId hoặc ticketProductId hoặc ticketRadiologyId

  @Column({ default: 0 })
  @Expose()
  commissionMoney: number

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

    entity.commissionValue = Number(raw.commissionValue)
    entity.createdAt = Number(raw.createdAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketUser]: any }[]) {
    return raws.map((i) => TicketUser.fromRaw(i))
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

export type TicketUserSortType = {
  [P in keyof Pick<TicketUser, 'oid' | 'id' | 'createdAt'>]?: 'ASC' | 'DESC'
}
