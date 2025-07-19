import { Expose } from 'class-transformer'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import UserRoom from './user-room.entity'

export enum RoomInteractType {
  Ticket = 1,
  Product = 2,
  Procedure = 3,
  Laboratory = 4,
  Radiology = 5,
  Reception = 6,
}

@Entity('Room')
export default class Room {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 50, default: '' })
  @Expose()
  roomCode: string

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'smallint', default: RoomInteractType.Product })
  @Expose()
  roomInteractType: RoomInteractType

  @Column({ type: 'smallint', default: 1 })
  @Expose()
  isCommon: 0 | 1

  @Expose()
  @OneToMany((type) => UserRoom, (userRoom) => userRoom.room)
  userRoomList: UserRoom[]

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
  [P in keyof Pick<Room, 'userRoomList'>]?:
  | { [P in keyof Pick<UserRoom, 'user' | 'room'>]?: boolean }
  | false
}

export type RoomInsertType = Omit<Room, keyof RoomRelationType | keyof Pick<Room, 'id'>>

export type RoomUpdateType = {
  [K in Exclude<keyof Room, keyof RoomRelationType | keyof Pick<Room, 'oid' | 'id'>>]:
  | Room[K]
  | (() => string)
}

export type RoomSortType = {
  [P in keyof Pick<Room, 'oid' | 'id' | 'roomCode' | 'name'>]?: 'ASC' | 'DESC'
}
