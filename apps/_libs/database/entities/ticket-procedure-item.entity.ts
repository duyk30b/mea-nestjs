import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { TicketProcedureStatus } from '../common/variable'
import Image from './image.entity'

@Entity('TicketProcedureItem')
@Index('IDX_TicketProcedureItem__oid_ticketId', ['oid', 'ticketId'])
export default class TicketProcedureItem {
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
  ticketProcedureId: number

  @Column({ type: 'smallint', default: TicketProcedureStatus.Pending })
  @Expose()
  status: TicketProcedureStatus

  @Column({ type: 'text', default: '' })
  @Expose({})
  result: string // Kết luận

  @Column({ type: 'varchar', length: 100, default: JSON.stringify([]) })
  @Expose()
  imageIds: string

  @Expose()
  imageList: Image[]

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

  static fromRaw(raw: { [P in keyof TicketProcedureItem]: any }) {
    if (!raw) return null
    const entity = new TicketProcedureItem()
    Object.assign(entity, raw)

    entity.completedAt = raw.completedAt == null ? raw.completedAt : Number(raw.completedAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof TicketProcedureItem]: any }[]) {
    return raws.map((i) => TicketProcedureItem.fromRaw(i))
  }
}

export type TicketProcedureItemRelationType = {
  [P in keyof Pick<TicketProcedureItem, 'imageList'>]?: boolean
}

export type TicketProcedureItemInsertType = Omit<
  TicketProcedureItem,
  keyof TicketProcedureItemRelationType | keyof Pick<TicketProcedureItem, 'id'>
>

export type TicketProcedureItemUpdateType = {
  [K in Exclude<
    keyof TicketProcedureItem,
    keyof TicketProcedureItemRelationType | keyof Pick<TicketProcedureItem, 'oid' | 'id'>
  >]: TicketProcedureItem[K] | (() => string)
}

export type TicketProcedureItemSortType = {
  [P in keyof Pick<TicketProcedureItem, 'id' | 'completedAt'>]?: 'ASC' | 'DESC'
}
