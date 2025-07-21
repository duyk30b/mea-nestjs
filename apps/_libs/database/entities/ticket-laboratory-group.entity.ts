import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { PaymentMoneyStatus, TicketLaboratoryStatus } from '../common/variable'
import Customer from './customer.entity'
import LaboratoryGroup from './laboratory-group.entity'
import TicketLaboratoryResult from './ticket-laboratory-result.entity'
import TicketLaboratory from './ticket-laboratory.entity'
import TicketUser from './ticket-user.entity'
import Ticket from './ticket.entity'

@Entity('TicketLaboratoryGroup')
@Index('IDX_TicketLaboratoryGroup__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketLaboratoryGroup__oid_registeredAt', ['oid', 'registeredAt'])
export default class TicketLaboratoryGroup {
  @Column({ name: 'oid' })
  @Exclude()
  oid: number

  @PrimaryGeneratedColumn({ name: 'id' })
  @Expose({ name: 'id' })
  id: number

  @Column()
  @Expose()
  ticketId: number

  @Expose()
  @Column({ default: 0 })
  roomId: number

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  laboratoryGroupId: number

  @Column({ type: 'smallint', default: TicketLaboratoryStatus.Pending })
  @Expose()
  status: TicketLaboratoryStatus

  @Column({ type: 'smallint', default: PaymentMoneyStatus.NoEffect })
  @Expose()
  paymentMoneyStatus: PaymentMoneyStatus

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  registeredAt: number

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  startedAt: number

  @Column({ type: 'text', default: '' })
  @Expose({})
  result: string // Kết luận

  @Expose()
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketLaboratoryList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  @Expose()
  @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: Customer

  @Expose()
  @ManyToOne((type) => LaboratoryGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'laboratoryGroupId', referencedColumnName: 'id' })
  laboratoryGroup: LaboratoryGroup

  @Expose()
  ticketUserList: TicketUser[]

  @Expose()
  ticketLaboratoryList: TicketLaboratory[]

  @Expose()
  ticketLaboratoryResultMap: Record<string, TicketLaboratoryResult>

  static fromRaw(raw: { [P in keyof TicketLaboratoryGroup]: any }) {
    if (!raw) return null
    const entity = new TicketLaboratoryGroup()
    Object.assign(entity, raw)

    entity.startedAt = raw.startedAt == null ? raw.startedAt : Number(raw.startedAt)
    entity.registeredAt = raw.registeredAt == null ? raw.registeredAt : Number(raw.registeredAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketLaboratoryGroup]: any }[]) {
    return raws.map((i) => TicketLaboratoryGroup.fromRaw(i))
  }
}

export type TicketLaboratoryGroupRelationType = {
  [P in keyof Pick<
    TicketLaboratoryGroup,
    | 'ticket'
    | 'customer'
    | 'laboratoryGroup'
    | 'ticketUserList'
    | 'ticketLaboratoryList'
    | 'ticketLaboratoryResultMap'
  >]?: boolean
}

export type TicketLaboratoryGroupInsertType = Omit<
  TicketLaboratoryGroup,
  keyof TicketLaboratoryGroupRelationType | keyof Pick<TicketLaboratoryGroup, 'id'>
>

export type TicketLaboratoryGroupUpdateType = {
  [K in Exclude<
    keyof TicketLaboratoryGroup,
    keyof TicketLaboratoryGroupRelationType | keyof Pick<TicketLaboratoryGroup, 'oid' | 'id'>
  >]: TicketLaboratoryGroup[K] | (() => string)
}

export type TicketLaboratoryGroupSortType = {
  [P in keyof Pick<
    TicketLaboratoryGroup,
    'id' | 'ticketId' | 'laboratoryGroupId' | 'registeredAt' | 'startedAt'
  >]?: 'ASC' | 'DESC'
}
