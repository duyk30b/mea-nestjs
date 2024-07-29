import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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
  name: string

  @Column({ type: 'text', default: '' })
  @Expose()
  initVariable: string // Dạng HTML

  @Column({ type: 'text', default: '' })
  @Expose()
  dataExample: string // Dạng HTML

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

export type PrintHtmlRelationType = Pick<PrintHtml, never>

export type PrintHtmlSortType = Pick<PrintHtml, 'id'>

export type PrintHtmlInsertType = Omit<
  PrintHtml,
  keyof PrintHtmlRelationType | keyof Pick<PrintHtml, 'id' | 'updatedAt'>
>

export type PrintHtmlUpdateType = Omit<
  PrintHtml,
  keyof PrintHtmlRelationType | keyof Pick<PrintHtml, 'id' | 'oid' | 'updatedAt'>
>
