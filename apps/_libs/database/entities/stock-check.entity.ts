import { Exclude, Expose } from 'class-transformer'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import StockCheckItem from './stock-check-item.entity'
import User from './user.entity'

export enum StockCheckStatus {
  Draft = 0, // create(), update(), delete() => Nháp
  Pending = 1, // submit() => Đang chờ duyệt
  Confirmed = 2, // approve() => Đã được duyệt
  Balanced = 4, // reconcile() => Đã cân bằng
  Cancelled = 5, // void() => Hủy
}

@Entity('StockCheck')
@Index('IDX_StockCheck__oid_createdAt', ['oid', 'createdAt'])
export default class StockCheck {
  @Column()
  @Exclude()
  oid: number

  @PrimaryColumn({ type: 'bigint' })
  @Expose()
  id: string

  @Column({
    type: 'bigint',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  createdAt: number

  @Column({
    type: 'bigint',
    default: () => '(EXTRACT(epoch FROM now()) * (1000))',
    transformer: {
      to: (value) => value,
      from: (value) => (value == null ? value : Number(value)),
    },
  })
  @Expose()
  updatedAt: number

  @Column()
  @Expose()
  createdByUserId: number

  @Column()
  @Expose()
  updatedByUserId: number

  @Column({ type: 'smallint' })
  @Expose()
  status: StockCheckStatus

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  note: string // Ghi chú

  @Expose()
  @OneToMany(() => StockCheckItem, (stockCheckItem) => stockCheckItem.stockCheck)
  stockCheckItemList: StockCheckItem[]

  @Expose()
  @ManyToOne((type) => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'createdByUserId', referencedColumnName: 'id' })
  createdByUser: User

  @Expose()
  @ManyToOne((type) => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'updatedByUserId', referencedColumnName: 'id' })
  updatedByUser: User

  static fromRaw(raw: { [P in keyof StockCheck]: any }) {
    if (!raw) return null
    const entity = new StockCheck()
    Object.assign(entity, raw)

    entity.updatedAt = Number(raw.updatedAt)
    entity.createdAt = Number(raw.createdAt)
    return entity
  }

  static fromRaws(raws: { [P in keyof StockCheck]: any }[]) {
    return raws.map((i) => StockCheck.fromRaw(i))
  }
}

export type StockCheckRelationType = {
  [P in keyof Pick<StockCheck, 'updatedByUser' | 'createdByUser'>]?: boolean
} & {
  [P in keyof Pick<StockCheck, 'stockCheckItemList'>]?:
  | { [P in keyof Pick<StockCheckItem, 'product' | 'batch'>]?: boolean }
  | false
}

export type StockCheckInsertType = Omit<
  StockCheck,
  keyof StockCheckRelationType | keyof Pick<StockCheck, 'id'>
>

export type StockCheckUpdateType = {
  [K in Exclude<
    keyof StockCheck,
    keyof StockCheckRelationType | keyof Pick<StockCheck, 'oid' | 'id'>
  >]: StockCheck[K] | (() => string)
}

export type StockCheckSortType = {
  [P in keyof Pick<StockCheck, 'id' | 'createdAt'>]?: 'ASC' | 'DESC'
}
