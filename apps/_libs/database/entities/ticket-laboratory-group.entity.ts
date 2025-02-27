import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Customer from './customer.entity'
import LaboratoryGroup from './laboratory-group.entity'
import { TicketLaboratoryStatus } from './ticket-laboratory.entity'
import Ticket from './ticket.entity'

@Entity('TicketLaboratoryGroup')
@Index('IDX_TicketLaboratoryGroup__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketLaboratoryGroup__oid_startedAt', ['oid', 'startedAt'])
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

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  laboratoryGroupId: number

  @Column({ type: 'smallint', default: TicketLaboratoryStatus.Pending })
  @Expose()
  status: TicketLaboratoryStatus

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
  [P in keyof Pick<TicketLaboratoryGroup, 'ticket' | 'customer' | 'laboratoryGroup'>]?: boolean
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
