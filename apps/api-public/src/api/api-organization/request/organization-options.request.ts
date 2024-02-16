import { Expose } from 'class-transformer'
import { IsBoolean } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class OrganizationRelationQuery {
  @Expose()
  @IsBoolean()
  users: boolean
}

export class OrganizationFilterQuery {}

export class OrganizationSortQuery extends SortQuery {}
