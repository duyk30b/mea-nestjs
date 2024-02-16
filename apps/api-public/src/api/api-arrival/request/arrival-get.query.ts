import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  ArrivalFilterQuery,
  ArrivalRelationQuery,
  ArrivalSortQuery,
} from './arrival-options.request'

export class ArrivalPaginationQuery extends PaginationQuery {
  @ApiPropertyOptional({ type: ArrivalFilterQuery })
  @Expose({ name: 'filter' })
  @Type(() => ArrivalFilterQuery)
  @ValidateNested({ each: true })
  filter: ArrivalFilterQuery

  @ApiPropertyOptional({ type: ArrivalRelationQuery })
  @Expose({ name: 'relation' })
  @Type(() => ArrivalRelationQuery)
  @ValidateNested({ each: true })
  relation: ArrivalRelationQuery

  @ApiPropertyOptional({ type: ArrivalSortQuery })
  @Expose({ name: 'sort' })
  @Type(() => ArrivalSortQuery)
  @ValidateNested({ each: true })
  sort: ArrivalSortQuery
}

export class ArrivalGetManyQuery {
  @ApiPropertyOptional({ type: ArrivalFilterQuery })
  @Expose({ name: 'filter' })
  @Type(() => ArrivalFilterQuery)
  @ValidateNested({ each: true })
  filter: ArrivalFilterQuery

  @ApiPropertyOptional({ type: ArrivalRelationQuery })
  @Expose({ name: 'relation' })
  @Type(() => ArrivalRelationQuery)
  @ValidateNested({ each: true })
  relation: ArrivalRelationQuery
}

export class ArrivalGetOneQuery {
  @ApiPropertyOptional({ type: ArrivalRelationQuery })
  @Expose({ name: 'relation' })
  @Type(() => ArrivalRelationQuery)
  @ValidateNested({ each: true })
  relation: ArrivalRelationQuery
}
