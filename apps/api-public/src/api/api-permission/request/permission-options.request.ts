import { Expose } from 'class-transformer'
import { IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class PermissionRelationQuery {}

export class PermissionFilterQuery {
  @Expose()
  @IsNumber()
  level: number
}

export class PermissionSortQuery extends SortQuery {}
