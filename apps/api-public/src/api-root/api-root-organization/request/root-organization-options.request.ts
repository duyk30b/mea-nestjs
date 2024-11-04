import { Expose } from 'class-transformer'
import { IsBoolean } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto'

export class RootOrganizationRelationQuery {
  @Expose()
  @IsBoolean()
  userList: boolean

  @Expose()
  @IsBoolean()
  logoImage: boolean
}

export class RootOrganizationFilterQuery {}

export class RootOrganizationSortQuery extends SortQuery {}
