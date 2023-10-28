import { Expose } from 'class-transformer'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base.entity'
import Invoice from './invoice.entity'

@Entity('InvoiceExpense')
@Index('IDX_InvoiceExpense__invoiceId', ['oid', 'invoiceId'])
export default class InvoiceExpense extends BaseEntity {
  @Column()
  @Expose()
  invoiceId: number

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  key: string

  @Column({ type: 'character varying', length: 255 })
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
  @ManyToOne((type) => Invoice, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'invoiceId', referencedColumnName: 'id' })
  invoice: Invoice
}
