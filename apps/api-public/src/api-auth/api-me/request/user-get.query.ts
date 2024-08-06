import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../_libs/common/dto/query'
import { UserFilterQuery, UserRelationQuery, UserSortQuery } from './user-options.request'

export class UserPaginationQuery extends PaginationQuery {
  @ApiPropertyOptional({ type: UserFilterQuery })
  @Expose()
  @Type(() => UserFilterQuery)
  @ValidateNested({ each: true })
  filter: UserFilterQuery

  @ApiPropertyOptional({ type: UserSortQuery })
  @Expose()
  @Type(() => UserSortQuery)
  @ValidateNested({ each: true })
  sort: UserSortQuery
}

export class UserGetManyQuery {
  @ApiPropertyOptional({ example: 10 })
  @Expose()
  @Type(() => Number)
  @IsInt()
  limit: number

  @ApiPropertyOptional({ type: UserFilterQuery })
  @Expose()
  @Type(() => UserFilterQuery)
  @ValidateNested({ each: true })
  filter: UserFilterQuery

  @ApiPropertyOptional({ type: UserRelationQuery })
  @Expose()
  @Type(() => UserRelationQuery)
  @ValidateNested({ each: true })
  relation: UserRelationQuery
}

export class UserGetOneQuery {
  @ApiPropertyOptional({ type: UserRelationQuery })
  @Expose()
  @Type(() => UserRelationQuery)
  @ValidateNested({ each: true })
  relation: UserRelationQuery
}
