import { Expose } from 'class-transformer'
import { IsIn, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RadiologySampleRelationQuery { }
export class RadiologySampleFilterQuery {
  @Expose()
  @IsNumber()
  radiologyId: number

  @Expose()
  @IsNumber()
  userId: number
}

export class RadiologySampleSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  radiologyId: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  priority: 'ASC' | 'DESC'
}
