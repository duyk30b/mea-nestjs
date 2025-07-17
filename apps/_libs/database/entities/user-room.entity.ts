import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Room from './room.entity'
import User from './user.entity'

@Entity('UserRoom')
export default class UserRoom {
  @Expose()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Expose()
  @Column()
  userId: number

  @Expose()
  @Column()
  roomId: number

  @Expose()
  @ManyToOne((type) => Room, (role) => role.userRoomList, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'roomId', referencedColumnName: 'id' })
  room: Room

  @Expose()
  @ManyToOne((type) => User, (user) => user.userRoomList, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User

  static fromRaw(raw: { [P in keyof UserRoom]: any }) {
    if (!raw) return null
    const entity = new UserRoom()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof UserRoom]: any }[]) {
    return raws.map((i) => UserRoom.fromRaw(i))
  }
}

export type UserRoomRelationType = {
  [P in keyof Pick<UserRoom, 'room' | 'user'>]?: boolean
}

export type UserRoomInsertType = Omit<
  UserRoom,
  keyof UserRoomRelationType | keyof Pick<UserRoom, 'id'>
>

export type UserRoomUpdateType = {
  [K in Exclude<
    keyof UserRoom,
    keyof UserRoomRelationType | keyof Pick<UserRoom, 'oid' | 'id'>
  >]: UserRoom[K] | (() => string)
}

export type UserRoomSortType = {
  [P in keyof Pick<UserRoom, 'oid'>]?: 'ASC' | 'DESC'
}
