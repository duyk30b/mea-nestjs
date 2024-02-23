// import { Expose } from 'class-transformer'
// import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
// import { BaseEntity } from '../common/base.entity'
// import { ArrivalStatus, ArrivalType } from '../common/variable'
// import Customer from './customer.entity'
// import Diagnosis from './diagnosis.entity'
// import Invoice from './invoice.entity'

// @Entity('Arrival')
// @Index(['oid'])
// @Index('IDX_ARRIVAL___OID__START_TIME', ['oid', 'startTime'])
// @Index('IDX_ARRIVAL___OID__CUSTOMER_ID__START_TIME', ['oid', 'customerId', 'startTime'])
// export default class Arrival extends BaseEntity {
//   @Column({ name: 'customer_id', nullable: true })
//   @Expose({ name: 'customer_id' })
//   customerId: number

//   // @Column({ type: 'smallint', default: 1 })
//   // @Expose()
//   // diagnosisStatus: DiagnosisStatus

//   // @Column({ type: 'smallint', default: 1 })
//   // @Expose()
//   // paymentStatus: PaymentStatus

//   @Column({
//     type: 'bigint',
//     default: () => '(EXTRACT(epoch FROM now()) * (1000))',
//     transformer: {
//       to: (value) => value,
//       from: (value) => (value == null ? value : Number(value)),
//     },
//   })
//   @Expose()
//   startTime: number

//   @Column({
//     type: 'bigint',
//     transformer: {
//       to: (value) => value,
//       from: (value) => (value == null ? value : Number(value)),
//     },
//   })
//   @Expose()
//   endTime: number

//   @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
//   @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
//   @Expose({ name: 'customer' })
//   customer: Customer

//   // @Expose({ name: 'invoices' })
//   // @OneToMany(() => Invoice, (invoice) => invoice.arrival)
//   // invoices: Invoice[]

//   @Expose({ name: 'diagnosis' })
//   diagnosis: Diagnosis
// }
