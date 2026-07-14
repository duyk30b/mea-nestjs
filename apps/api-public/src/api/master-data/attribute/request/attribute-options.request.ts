import { SortQuery } from '@libs/common/dto/query'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'

export class AttributeRelationQuery {

}
export class AttributeFilterQuery {

}

export class AttributeSortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  key?: 'ASC' | 'DESC'
}
