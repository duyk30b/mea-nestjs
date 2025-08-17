import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { TicketRegimenStatus } from '../common/variable'
import Customer from './customer.entity'
import Procedure from './procedure.entity'
import RegimenItem from './regimen-item.entity'
import Regimen from './regimen.entity'
import TicketRegimen from './ticket-regimen.entity'
import Ticket from './ticket.entity'

@Entity('TicketRegimenItem')
@Index('IDX_TicketRegimenItem__oid_ticketId', ['oid', 'ticketId'])
export default class TicketRegimenItem {
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
  ticketRegimenId: number

  @Column()
  @Expose()
  regimenItemId: number

  @Column()
  @Expose()
  regimenId: number

  @Column()
  @Expose()
  procedureId: number

  @Column({ type: 'smallint', default: TicketRegimenStatus.Pending })
  @Expose()
  status: TicketRegimenStatus

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  completedAt: number

  @Expose()
  ticket: Ticket

  @Expose()
  customer: Customer

  @Expose()
  regimen: Regimen

  @Expose()
  regimenItem: RegimenItem

  @Expose()
  ticketRegimen: TicketRegimen

  @Expose()
  procedure: Procedure

  static fromRaw(raw: { [P in keyof TicketRegimenItem]: any }) {
    if (!raw) return null
    const entity = new TicketRegimenItem()
    Object.assign(entity, raw)

    entity.completedAt = raw.completedAt == null ? raw.completedAt : Number(raw.completedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketRegimenItem]: any }[]) {
    return raws.map((i) => TicketRegimenItem.fromRaw(i))
  }
}

export type TicketRegimenItemRelationType = {
  [P in keyof Pick<
    TicketRegimenItem,
    'ticket' | 'customer' | 'regimen' | 'regimenItem' | 'ticketRegimen' | 'procedure'
  >]?: boolean
}

export type TicketRegimenItemInsertType = Omit<
  TicketRegimenItem,
  keyof TicketRegimenItemRelationType | keyof Pick<TicketRegimenItem, 'id'>
>

export type TicketRegimenItemUpdateType = {
  [K in Exclude<
    keyof TicketRegimenItem,
    keyof TicketRegimenItemRelationType | keyof Pick<TicketRegimenItem, 'oid' | 'id'>
  >]: TicketRegimenItem[K] | (() => string)
}

export type TicketRegimenItemSortType = {
  [P in keyof Pick<TicketRegimenItem, 'id' | 'ticketId' | 'customerId' | 'completedAt'>]?:
  | 'ASC'
  | 'DESC'
}
