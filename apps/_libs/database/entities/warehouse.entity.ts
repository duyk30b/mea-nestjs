import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('Warehouse')
export default class Warehouse {
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

  @Expose()
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  deletedAt: number

  static fromRaw(raw: { [P in keyof Warehouse]: any }) {
    if (!raw) return null
    const entity = new Warehouse()
    Object.assign(entity, raw)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)
    entity.deletedAt = raw.deletedAt == null ? raw.deletedAt : Number(raw.deletedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof Warehouse]: any }[]) {
    return raws.map((i) => Warehouse.fromRaw(i))
  }
}

export type WarehouseRelationType = {
  [P in keyof Pick<Warehouse, never>]?: boolean
}

export type WarehouseInsertType = Omit<
  Warehouse,
  keyof WarehouseRelationType | keyof Pick<Warehouse, 'id' | 'updatedAt' | 'deletedAt'>
>

export type WarehouseUpdateType = {
  [K in Exclude<
    keyof Warehouse,
    keyof WarehouseRelationType | keyof Pick<Warehouse, 'oid' | 'id' | 'updatedAt'>
  >]: Warehouse[K] | (() => string)
}

export type WarehouseSortType = {
  [P in keyof Pick<Warehouse, 'oid' | 'id' | 'name'>]?: 'ASC' | 'DESC'
}
