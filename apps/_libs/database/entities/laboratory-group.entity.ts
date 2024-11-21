import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import PrintHtml from './print-html.entity'

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
  printHtmlId: number

  @ManyToOne((type) => PrintHtml, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'printHtmlId', referencedColumnName: 'id' })
  @Expose()
  printHtml: PrintHtml

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

export type LaboratoryGroupRelationType = Pick<LaboratoryGroup, 'printHtml'>

export type LaboratoryGroupSortType = Pick<LaboratoryGroup, 'oid' | 'id' | 'name'>

export type LaboratoryGroupInsertType = Omit<
  LaboratoryGroup,
  keyof LaboratoryGroupRelationType | keyof Pick<LaboratoryGroup, 'id'>
>

export type LaboratoryGroupUpdateType = Omit<
  LaboratoryGroup,
  keyof LaboratoryGroupRelationType | keyof Pick<LaboratoryGroup, 'oid' | 'id'>
>

export type LaboratoryGroupReplaceType = Omit<
  LaboratoryGroup,
  keyof LaboratoryGroupRelationType | keyof Pick<LaboratoryGroup, 'oid'>
>
