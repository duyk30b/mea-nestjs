import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsObject, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../../_libs/common/dto'
import { TicketGetQuery } from '../../../ticket/ticket-query/request'

class StatisticTicketSortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  countTicket: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  customerId: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumItemsCostAmount: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumSurcharge: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumExpense: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumTotalMoney: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumDebt: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumProfit: 'ASC' | 'DESC'
}

export class StatisticTicketGroupQuery {
  @Expose()
  @IsBoolean()
  year?: boolean

  @Expose()
  @IsBoolean()
  month?: boolean

  @Expose()
  @IsBoolean()
  date?: boolean
}

export class StatisticTicketQuery extends IntersectionType(
  PickType(TicketGetQuery, ['filter', 'relation']),
  PaginationQuery
) {
  @ApiPropertyOptional({ type: String })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(StatisticTicketSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sortStatistic?: StatisticTicketSortQuery

  @ApiPropertyOptional({ type: String })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(StatisticTicketGroupQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  groupStatistic?: StatisticTicketGroupQuery
}
