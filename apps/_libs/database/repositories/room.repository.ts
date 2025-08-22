import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Room } from '../entities'
import {
  RoomInsertType,
  RoomRelationType,
  RoomSortType,
  RoomUpdateType,
} from '../entities/room.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class RoomManager extends _PostgreSqlManager<
  Room,
  RoomRelationType,
  RoomInsertType,
  RoomUpdateType,
  RoomSortType
> {
  constructor() {
    super(Room)
  }
}

@Injectable()
export class RoomRepository extends _PostgreSqlRepository<
  Room,
  RoomRelationType,
  RoomInsertType,
  RoomUpdateType,
  RoomSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Room) private roomRepository: Repository<Room>
  ) {
    super(Room, roomRepository)
  }
}
