import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import UserRoom, {
  UserRoomInsertType,
  UserRoomRelationType,
  UserRoomSortType,
  UserRoomUpdateType,
} from '../entities/user-room.entity'
import { _PostgreSqlManager } from '../managers/_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class UserRoomManager extends _PostgreSqlManager<
  UserRoom,
  UserRoomRelationType,
  UserRoomInsertType,
  UserRoomUpdateType,
  UserRoomSortType
> {
  constructor() {
    super(UserRoom)
  }
}

@Injectable()
export class UserRoomRepository extends _PostgreSqlRepository<
  UserRoom,
  UserRoomRelationType,
  UserRoomInsertType,
  UserRoomUpdateType,
  UserRoomSortType
> {
  constructor(@InjectRepository(UserRoom) private userRoomRepository: Repository<UserRoom>) {
    super(UserRoom, userRoomRepository)
  }
}
