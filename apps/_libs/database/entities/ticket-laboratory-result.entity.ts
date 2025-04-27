import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Customer from './customer.entity'
import Laboratory from './laboratory.entity'
import Ticket from './ticket.entity'

@Entity('TicketLaboratoryResult')
@Index('IDX_TicketLaboratoryResult__oid_ticketId', ['oid', 'ticketId'])
@Index('IDX_TicketLaboratoryResult__oid_laboratoryId', ['oid', 'laboratoryId'])
export default class TicketLaboratoryResult extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column()
  @Expose()
  customerId: number

  @Column()
  @Expose()
  laboratoryId: number

  @Column()
  @Expose()
  ticketLaboratoryId: number

  @Column()
  @Expose()
  ticketLaboratoryGroupId: number

  @Column({ type: 'varchar', length: 255 })
  @Expose({})
  result: string

  @Column({ type: 'smallint', default: 0 })
  @Expose({})
  attention: number

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
  @ManyToOne((type) => Laboratory, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'laboratoryId', referencedColumnName: 'id' })
  laboratory: Laboratory

  static fromRaw(raw: { [P in keyof TicketLaboratoryResult]: any }) {
    if (!raw) return null
    const entity = new TicketLaboratoryResult()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof TicketLaboratoryResult]: any }[]) {
    return raws.map((i) => TicketLaboratoryResult.fromRaw(i))
  }
}

export type TicketLaboratoryResultRelationType = {
  [P in keyof Pick<TicketLaboratoryResult, 'ticket' | 'customer' | 'laboratory'>]?: boolean
}

export type TicketLaboratoryResultInsertType = Omit<
  TicketLaboratoryResult,
  keyof TicketLaboratoryResultRelationType | keyof Pick<TicketLaboratoryResult, 'id'>
>

export type TicketLaboratoryResultUpdateType = {
  [K in Exclude<
    keyof TicketLaboratoryResult,
    keyof TicketLaboratoryResultRelationType | keyof Pick<TicketLaboratoryResult, 'oid' | 'id'>
  >]: TicketLaboratoryResult[K] | (() => string)
}

export type TicketLaboratoryResultSortType = {
  [P in keyof Pick<TicketLaboratoryResult, 'id' | 'ticketId' | 'laboratoryId'>]?: 'ASC' | 'DESC'
}
