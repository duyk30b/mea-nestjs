import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'
import { SortQuery } from '../../../../../../_libs/common/dto/query'

export class AttributeRelationQuery {

}
export class AttributeFilterQuery {

}

export class AttributeSortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  key?: 'ASC' | 'DESC'
}
