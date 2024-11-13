import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('RadiologyGroup')
export default class RadiologyGroup {
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
  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  updatedAt: number

  static fromRaw(raw: { [P in keyof RadiologyGroup]: any }) {
    if (!raw) return null
    const entity = new RadiologyGroup()
    Object.assign(entity, raw)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof RadiologyGroup]: any }[]) {
    return raws.map((i) => RadiologyGroup.fromRaw(i))
  }
}

export type RadiologyGroupRelationType = Pick<RadiologyGroup, never>

export type RadiologyGroupSortType = Pick<RadiologyGroup, 'oid' | 'id' | 'name'>

export type RadiologyGroupInsertType = Omit<
  RadiologyGroup,
  keyof RadiologyGroupRelationType | keyof Pick<RadiologyGroup, 'id' | 'updatedAt'>
>

export type RadiologyGroupUpdateType = Omit<
  RadiologyGroup,
  keyof RadiologyGroupRelationType | keyof Pick<RadiologyGroup, 'oid' | 'id' | 'updatedAt'>
>
