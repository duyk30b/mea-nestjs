import { SortQuery } from '@libs/common/dto/query'
import { Expose } from 'class-transformer'
import { IsIn, IsOptional } from 'class-validator'

export class RoomRelationQuery {
  @Expose()
  @IsOptional()
  userRoomList: false | { user?: boolean }
}

export class RoomFilterQuery { }

export class RoomSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  code: 'ASC' | 'DESC'
}
