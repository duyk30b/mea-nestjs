import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Radiology from './radiology.entity'

export const PrintHtmlType = {
  DIAGNOSIS: 'Phiếu khám và chẩn đoán',
  PRESCRIPTION: 'Đơn thuốc',
  INVOICE: 'Hóa đơn',
  RADIOLOGY: 'Phiếu chẩn đoán hình ảnh',
}

@Entity('PrintHtml')
export default class PrintHtml {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'character varying', length: 255 })
  @Expose()
  key: keyof typeof PrintHtmlType

  @Column({ default: 0 })
  @Expose()
  radiologyId: number

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

  @ManyToOne((type) => Radiology, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'radiologyId', referencedColumnName: 'id' })
  @Expose()
  radiology: Radiology

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

export type PrintHtmlRelationType = Pick<PrintHtml, 'radiology'>

export type PrintHtmlSortType = Pick<PrintHtml, 'id'>

export type PrintHtmlInsertType = Omit<
  PrintHtml,
  keyof PrintHtmlRelationType | keyof Pick<PrintHtml, 'id' | 'updatedAt'>
>

export type PrintHtmlUpdateType = Omit<
  PrintHtml,
  keyof PrintHtmlRelationType | keyof Pick<PrintHtml, 'id' | 'oid' | 'updatedAt'>
>
