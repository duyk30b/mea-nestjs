import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Ticket from './ticket.entity'

@Entity('TicketSurcharge')
@Index('IDX_TicketSurcharge__ticketId', ['oid', 'ticketId'])
export default class TicketSurcharge extends BaseEntity {
  @Column()
  @Expose()
  ticketId: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  key: string

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  name: string

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (value) => value, from: (value) => Number(value) },
  })
  @Expose()
  money: number

  @Expose()
  @ManyToOne((type) => Ticket, (ticket) => ticket.ticketSurchargeList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticketId', referencedColumnName: 'id' })
  ticket: Ticket

  static fromRaw(raw: { [P in keyof TicketSurcharge]: any }) {
    if (!raw) return null
    const entity = new TicketSurcharge()
    Object.assign(entity, raw)

    entity.money = Number(raw.money)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketSurcharge]: any }[]) {
    return raws.map((i) => TicketSurcharge.fromRaw(i))
  }
}

export type TicketSurchargeRelationType = {
  [P in keyof Pick<TicketSurcharge, 'ticket'>]?: boolean
}

export type TicketSurchargeInsertType = Omit<
  TicketSurcharge,
  keyof TicketSurchargeRelationType | keyof Pick<TicketSurcharge, 'id'>
>

export type TicketSurchargeUpdateType = {
  [K in Exclude<
    keyof TicketSurcharge,
    keyof TicketSurchargeRelationType | keyof Pick<TicketSurcharge, 'oid' | 'id'>
  >]: TicketSurcharge[K] | (() => string)
}

export type TicketSurchargeSortType = {
  [P in keyof Pick<TicketSurcharge, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
