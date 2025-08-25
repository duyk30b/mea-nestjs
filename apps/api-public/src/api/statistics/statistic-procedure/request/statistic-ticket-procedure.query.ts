import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsIn, IsObject, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../../_libs/common/dto'
import { TicketProcedureGetQuery } from '../../../api-ticket-procedure/request'

class StatisticTicketProcedureSortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  procedureId: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  count: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumQuantity: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumActualAmount: 'ASC' | 'DESC'
}

export class StatisticTicketProcedureQuery extends IntersectionType(
  PickType(TicketProcedureGetQuery, ['filter', 'relation']),
  PaginationQuery
) {
  @ApiPropertyOptional({ type: String })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(StatisticTicketProcedureSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sortStatistic?: StatisticTicketProcedureSortQuery
}
