// import { Expose } from 'class-transformer'
// import { Column, Entity, Index } from 'typeorm'
// import { BaseEntity } from '../common/base.entity'

// @Entity('Diagnosis')
// @Index(['arrivalId'])
// export default class Diagnosis extends BaseEntity {
//   @Column({ nullable: true })
//   @Expose({})
//   arrivalId: number

//   @Column({ nullable: true })
//   @Expose({})
//   reason: string // Lý do vào viện

//   @Column({ type: 'text', nullable: true })
//   @Expose({})
//   summary: string // Tóm tăt bệnh án

//   @Column({ nullable: true })
//   @Expose({})
//   diagnosis: string // Chẩn đoán

//   @Column({ type: 'text', default: '{}' })
//   @Expose()
//   vitalSigns: string

//   @Column({ type: 'tinyint', unsigned: true, nullable: true }) // ----- tinyint_unsigned: 0 -> 256
//   @Expose({})
//   pulse: number // Mạch

//   @Column({ type: 'float', precision: 3, scale: 1, nullable: true })
//   @Expose({})
//   temperature: number // Nhiệt độ

//   @Column({ length: 10, nullable: true })
//   @Expose({})
//   bloodPressure: string // Huyết áp

//   @Column({ type: 'tinyint', nullable: true }) // ----- tinyint: -128 -> 127
//   @Expose({})
//   respiratoryRate: number // Nhịp thở

//   @Column({ type: 'tinyint', nullable: true })
//   @Expose({})
//   spO2: number // Sp02

//   @Column({ type: 'tinyint', unsigned: true, nullable: true }) // ----- tinyint_unsigned: 0 -> 256
//   @Expose({})
//   height: number // Chiều cao

//   @Column({ type: 'tinyint', unsigned: true, nullable: true }) // ----- tinyint_unsigned: 0 -> 256
//   @Expose({})
//   weight: number // Cân nặng

//   @Column({ nullable: true })
//   @Expose({})
//   note: string // Ghi chú
// }
