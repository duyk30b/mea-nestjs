import { Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum RoomInteractType {
  Ticket = 1,
  Product = 2,
  Procedure = 3,
  Laboratory = 4,
  Radiology = 5,
}

@Entity('Room')
export default class Room {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'smallint', default: RoomInteractType.Product })
  @Expose()
  roomInteractType: RoomInteractType

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isCommon: 0 | 1

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  showMenu: 0 | 1

  static fromRaw(raw: { [P in keyof Room]: any }) {
    if (!raw) return null
    const entity = new Room()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Room]: any }[]) {
    return raws.map((i) => Room.fromRaw(i))
  }
}

export type RoomRelationType = {
  [P in keyof Pick<Room, never>]?: boolean
}

export type RoomInsertType = Omit<
  Room,
  keyof RoomRelationType | keyof Pick<Room, 'id'>
>

export type RoomUpdateType = {
  [K in Exclude<
    keyof Room,
    keyof RoomRelationType | keyof Pick<Room, 'oid' | 'id'>
  >]: Room[K] | (() => string)
}

export type RoomSortType = {
  [P in keyof Pick<Room, 'oid' | 'id' | 'name'>]?: 'ASC' | 'DESC'
}
