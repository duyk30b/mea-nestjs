import { SortQuery } from '@libs/common/dto/query'
import { Expose } from 'class-transformer'
import { IsBoolean } from 'class-validator'

export class OrganizationRelationQuery {
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

export class OrganizationFilterQuery { }

export class OrganizationSortQuery extends SortQuery { }
