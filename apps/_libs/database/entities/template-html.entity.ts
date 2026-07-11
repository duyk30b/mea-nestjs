import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('TemplateHtml')
export default class TemplateHtml {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ default: 0 })
  priority: number

  @Expose()
  @Column({ default: 0 })
  templateHtmlType: number

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
  htmlPrint: string // Dạng HTML

  @Column({ type: 'text', default: '' })
  @Expose()
  cssPrint: string // Dạng CSS

  @Column({ type: 'text', default: '' })
  @Expose()
  htmlInput: string // Dạng HTML

  @Column({ type: 'text', default: '' })
  @Expose()
  jsInput: string // Dạng JavaScript

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

  static fromRaw(raw: { [P in keyof TemplateHtml]: any }) {
    if (!raw) return null
    const entity = new TemplateHtml()
    Object.assign(entity, raw)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof TemplateHtml]: any }[]) {
    return raws.map((i) => TemplateHtml.fromRaw(i))
  }
}

export type TemplateHtmlRelationType = {
  [P in keyof Pick<TemplateHtml, never>]?: boolean
}

export type TemplateHtmlInsertType = Omit<
  TemplateHtml,
  keyof TemplateHtmlRelationType | keyof Pick<TemplateHtml, 'id' | 'updatedAt'>
>

export type TemplateHtmlUpdateType = {
  [K in Exclude<
    keyof TemplateHtml,
    keyof TemplateHtmlRelationType | keyof Pick<TemplateHtml, 'oid' | 'id' | 'updatedAt'>
  >]: TemplateHtml[K] | (() => string)
}

export type TemplateHtmlSortType = {
  [P in keyof Pick<TemplateHtml, 'id' | 'priority'>]?: 'ASC' | 'DESC'
}
