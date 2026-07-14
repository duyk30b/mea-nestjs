import { SortQuery } from '@libs/common/dto'
import { Expose } from 'class-transformer'
import { IsBoolean } from 'class-validator'

export class RootOrganizationRelationQuery {
  @Expose()
  @IsBoolean()
  userList: boolean

  @Expose()
  @IsBoolean()
  organizationPaymentList: boolean

  @Expose()
  @IsBoolean()
  logoImage: boolean
}

export class RootOrganizationFilterQuery { }

export class RootOrganizationSortQuery extends SortQuery { }
