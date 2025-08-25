import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsIn, IsObject, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../../_libs/common/dto'
import { TicketProductGetQuery } from '../../../api-ticket-product/request'

class StatisticTicketProductSortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  productId: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  count: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumQuantity: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumCostAmount: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumActualAmount: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumProfitAmount: 'ASC' | 'DESC'
}

export class StatisticTicketProductQuery extends IntersectionType(
  PickType(TicketProductGetQuery, ['filter', 'relation']),
  PaginationQuery
) {
  @ApiPropertyOptional({ type: String })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(StatisticTicketProductSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sortStatistic?: StatisticTicketProductSortQuery
}
