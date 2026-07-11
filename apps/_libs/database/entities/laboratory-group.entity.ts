import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import TemplateHtml from './template-html.entity'

@Entity('LaboratoryGroup')
export default class LaboratoryGroup {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Expose()
  @Column({ default: 0 })
  roomId: number

  @Expose()
  @Column({ default: 0 })
  templateHtmlId: number

  @ManyToOne((type) => TemplateHtml, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'templateHtmlId', referencedColumnName: 'id' })
  @Expose()
  templateHtml: TemplateHtml

  static fromRaw(raw: { [P in keyof LaboratoryGroup]: any }) {
    if (!raw) return null
    const entity = new LaboratoryGroup()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof LaboratoryGroup]: any }[]) {
    return raws.map((i) => LaboratoryGroup.fromRaw(i))
  }
}

export type LaboratoryGroupRelationType = {
  [P in keyof Pick<LaboratoryGroup, 'templateHtml'>]?: boolean
}

export type LaboratoryGroupInsertType = Omit<
  LaboratoryGroup,
  keyof LaboratoryGroupRelationType | keyof Pick<LaboratoryGroup, 'id'>
>

export type LaboratoryGroupUpdateType = {
  [K in Exclude<
    keyof LaboratoryGroup,
    keyof LaboratoryGroupRelationType | keyof Pick<LaboratoryGroup, 'oid' | 'id'>
  >]: LaboratoryGroup[K] | (() => string)
}

export type LaboratoryGroupSortType = {
  [P in keyof Pick<LaboratoryGroup, 'oid' | 'id' | 'name'>]?: 'ASC' | 'DESC'
}

export type LaboratoryGroupReplaceType = Omit<
  LaboratoryGroup,
  keyof LaboratoryGroupRelationType | keyof Pick<LaboratoryGroup, 'oid'>
>
