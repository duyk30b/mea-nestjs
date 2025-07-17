import { Expose } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RoomRelationQuery {
  @Expose()
  @IsOptional()
  userRoomList: false | { user?: boolean }
}

export class RoomFilterQuery { }

export class RoomSortQuery extends SortQuery { }
