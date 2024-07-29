import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('ProductGroup')
export default class ProductGroup {
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

  static fromRaw(raw: { [P in keyof ProductGroup]: any }) {
    if (!raw) return null
    const entity = new ProductGroup()
    Object.assign(entity, raw)

    entity.updatedAt = raw.updatedAt == null ? raw.updatedAt : Number(raw.updatedAt)

    return entity
  }

  static fromRaws(raws: { [P in keyof ProductGroup]: any }[]) {
    return raws.map((i) => ProductGroup.fromRaw(i))
  }
}

export type ProductGroupRelationType = Pick<ProductGroup, never>

export type ProductGroupSortType = Pick<ProductGroup, 'oid' | 'id' | 'name'>

export type ProductGroupInsertType = Omit<
  ProductGroup,
  keyof ProductGroupRelationType | keyof Pick<ProductGroup, 'id' | 'updatedAt'>
>

export type ProductGroupUpdateType = Omit<
  ProductGroup,
  keyof ProductGroupRelationType | keyof Pick<ProductGroup, 'oid' | 'id' | 'updatedAt'>
>
