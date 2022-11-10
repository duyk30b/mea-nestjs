import { Expose } from 'class-transformer'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../common/base.entity'

@Entity('diagnosis')
@Index(['arrivalId'])
export default class Diagnosis extends BaseEntity {
	@Column({ name: 'arrival_id', nullable: true })
	@Expose({ name: 'arrival_id' })
	arrivalId: number

	@Column({ name: 'reason', nullable: true })
	@Expose({ name: 'reason' })
	reason: string                               // Lý do vào viện

	@Column({ name: 'summary', type: 'text', nullable: true })
	@Expose({ name: 'summary' })
	summary: string                              // Tóm tăt bệnh án

	@Column({ name: 'diagnosis', nullable: true })
	@Expose({ name: 'diagnosis' })
	diagnosis: string                            // Chẩn đoán

	@Column({ name: 'pulse', type: 'tinyint', unsigned: true, nullable: true })               // ----- tinyint_unsigned: 0 -> 256
	@Expose({ name: 'pulse' })
	pulse: number                                // Mạch

	@Column({ name: 'temperature', type: 'float', precision: 3, scale: 1, nullable: true })
	@Expose({ name: 'temperature' })
	temperature: number                          // Nhiệt độ

	@Column({ name: 'blood_pressure', length: 10, nullable: true })
	@Expose({ name: 'blood_pressure' })
	bloodPressure: string                        // Huyết áp

	@Column({ name: 'respiratory_rate', type: 'tinyint', nullable: true })                    // ----- tinyint: -128 -> 127
	@Expose({ name: 'respiratory_rate' })
	respiratoryRate: number                      // Nhịp thở

	@Column({ name: 'spo2', type: 'tinyint', nullable: true })
	@Expose({ name: 'spo2' })
	spO2: number                                 // Sp02

	@Column({ name: 'height', type: 'tinyint', unsigned: true, nullable: true })               // ----- tinyint_unsigned: 0 -> 256
	@Expose({ name: 'height' })
	height: number                               // Chiều cao

	@Column({ name: 'weight', type: 'tinyint', unsigned: true, nullable: true })               // ----- tinyint_unsigned: 0 -> 256
	@Expose({ name: 'weight' })
	weight: number                               // Cân nặng

	@Column({ name: 'note', nullable: true })
	@Expose({ name: 'note' })
	note: string                                 // Ghi chú
} 
