import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('ProcedureGroup')
export default class ProcedureGroup {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  static fromRaw(raw: { [P in keyof ProcedureGroup]: any }) {
    if (!raw) return null
    const entity = new ProcedureGroup()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof ProcedureGroup]: any }[]) {
    return raws.map((i) => ProcedureGroup.fromRaw(i))
  }
}

export type ProcedureGroupRelationType = Pick<ProcedureGroup, never>

export type ProcedureGroupSortType = Pick<ProcedureGroup, 'oid' | 'id' | 'name'>

export type ProcedureGroupInsertType = Omit<
  ProcedureGroup,
  keyof ProcedureGroupRelationType | keyof Pick<ProcedureGroup, 'id'>
>

export type ProcedureGroupUpdateType = Omit<
  ProcedureGroup,
  keyof ProcedureGroupRelationType | keyof Pick<ProcedureGroup, 'oid' | 'id'>
>
