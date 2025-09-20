import { Expose } from 'class-transformer'
import { IsBoolean, IsIn, IsObject } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RegimenRelationQuery {
  @Expose()
  @IsObject()
  regimenItemList: { procedure: boolean }

  @Expose()
  @IsBoolean()
  positionList: boolean

  @Expose()
  @IsBoolean()
  discountList: boolean
}

export class RegimenFilterQuery {
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class RegimenSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  name: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  code: 'ASC' | 'DESC'
}
