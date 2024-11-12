import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('ParaclinicalGroup')
export default class ParaclinicalGroup {
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
  paraclinicalGroupId: number

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

  static fromRaw(raw: { [P in keyof ParaclinicalGroup]: any }) {
    if (!raw) return null
    const entity = new ParaclinicalGroup()
    Object.assign(entity, raw)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof ParaclinicalGroup]: any }[]) {
    return raws.map((i) => ParaclinicalGroup.fromRaw(i))
  }
}

export type ParaclinicalGroupRelationType = Pick<ParaclinicalGroup, never>

export type ParaclinicalGroupSortType = Pick<ParaclinicalGroup, 'oid' | 'id' | 'name'>

export type ParaclinicalGroupInsertType = Omit<
  ParaclinicalGroup,
  keyof ParaclinicalGroupRelationType | keyof Pick<ParaclinicalGroup, 'id' | 'updatedAt'>
>

export type ParaclinicalGroupUpdateType = Omit<
  ParaclinicalGroup,
  keyof ParaclinicalGroupRelationType | keyof Pick<ParaclinicalGroup, 'oid' | 'id' | 'updatedAt'>
>
