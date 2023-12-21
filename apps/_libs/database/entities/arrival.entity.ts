// import { Expose } from 'class-transformer'
// import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
// import { BaseEntity } from '../common/base.entity'
// import { ArrivalStatus, ArrivalType } from '../common/variable'
// import Customer from './customer.entity'
// import Diagnosis from './diagnosis.entity'
// import Invoice from './invoice.entity'

// @Entity('arrival')
// @Index(['oid'])
// @Index('IDX_ARRIVAL___OID__START_TIME', ['oid', 'startTime'])
// @Index('IDX_ARRIVAL___OID__CUSTOMER_ID__START_TIME', ['oid', 'customerId', 'startTime'])
// export default class Arrival extends BaseEntity {
//     @Column({ name: 'customer_id', nullable: true })
//     @Expose({ name: 'customer_id' })
//     customerId: number

//     @Column({ name: 'type', type: 'tinyint', default: 0 })
//     @Expose({ name: 'type' })
//     type: ArrivalType

//     @Column({ name: 'status', type: 'tinyint', default: 0 })
//     @Expose({ name: 'status' })
//     status: ArrivalStatus

//     @Column({
//         name: 'start_time',
//         type: 'bigint',
//         nullable: true,
//         transformer: {
//             to: (value) => value,
//             from: (value) => value == null ? value : Number(value),
//         },
//     })
//     @Expose({ name: 'start_time' })
//     startTime: number // Giờ vào khám

//     @Column({
//         name: 'end_time',
//         type: 'bigint',
//         nullable: true,
//         transformer: {
//             to: (value) => value,
//             from: (value) => value == null ? value : Number(value),
//         },
//     })
//     @Expose({ name: 'end_time' })
//     endTime: number // Giờ kết thúc khám

//     @ManyToOne((type) => Customer, { createForeignKeyConstraints: false })
//     @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
//     @Expose({ name: 'customer' })
//     customer: Customer

//     @Expose({ name: 'invoices' })
//     @OneToMany(() => Invoice, (invoice) => invoice.arrival)
//     invoices: Invoice[]

//     @Expose({ name: 'diagnosis' })
//     diagnosis: Diagnosis
// }
