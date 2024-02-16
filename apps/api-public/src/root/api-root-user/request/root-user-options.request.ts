import { Expose } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RootUserRelationQuery {
  @Expose()
  @IsBoolean()
  organization: boolean

  @Expose()
  @IsBoolean()
  role: boolean
}

export class RootUserFilterQuery {
  @Expose()
  @IsNumber()
  oid: number

  @Expose()
  @IsNumber()
  roleId: number
}

export class RootUserSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  oid: 'ASC' | 'DESC'
}
