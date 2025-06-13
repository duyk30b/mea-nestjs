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
  roomId: number

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

export type LaboratoryGroupRelationType = {
  [P in keyof Pick<LaboratoryGroup, 'printHtml'>]?: boolean
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
