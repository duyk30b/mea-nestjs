import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import Paraclinical from './paraclinical.entity'

export const PrintHtmlType = {
  DIAGNOSIS: 'Phiếu khám và chẩn đoán',
  OPTOMETRY: 'Phiếu đo thị lực',
  PRESCRIPTION: 'Đơn thuốc',
  INVOICE: 'Hóa đơn',
  PARACLINICAL: 'Phiếu cận lâm sàng',
}

@Entity('PrintHtml')
export default class PrintHtml {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  @Expose()
  type: keyof typeof PrintHtmlType

  @Column({ default: 0 })
  @Expose()
  paraclinicalId: number

  @Column({ type: 'text' })
  @Expose()
  content: string // Dạng HTML

  @Expose()
  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  updatedAt: number

  @OneToOne((type) => Paraclinical, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'paraclinicalId', referencedColumnName: 'id' })
  @Expose()
  paraclinical: Paraclinical

  static fromRaw(raw: { [P in keyof PrintHtml]: any }) {
    if (!raw) return null
    const entity = new PrintHtml()
    Object.assign(entity, raw)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof PrintHtml]: any }[]) {
    return raws.map((i) => PrintHtml.fromRaw(i))
  }
}

export type PrintHtmlRelationType = Pick<PrintHtml, 'paraclinical'>

export type PrintHtmlSortType = Pick<PrintHtml, 'id'>

export type PrintHtmlInsertType = Omit<
  PrintHtml,
  keyof PrintHtmlRelationType | keyof Pick<PrintHtml, 'id' | 'updatedAt'>
>

export type PrintHtmlUpdateType = Omit<
  PrintHtml,
  keyof PrintHtmlRelationType | keyof Pick<PrintHtml, 'id' | 'oid' | 'updatedAt'>
>
