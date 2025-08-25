import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsIn, IsObject, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../../_libs/common/dto'
import { TicketLaboratoryGetQuery } from '../../../api-ticket-laboratory/request'

class StatisticTicketLaboratorySortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  laboratoryId: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  count: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumCostAmount: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumActualAmount: 'ASC' | 'DESC'
}

export class StatisticTicketLaboratoryQuery extends IntersectionType(
  PickType(TicketLaboratoryGetQuery, ['filter', 'relation']),
  PaginationQuery
) {
  @ApiPropertyOptional({ type: String })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(StatisticTicketLaboratorySortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sortStatistic?: StatisticTicketLaboratorySortQuery
}
