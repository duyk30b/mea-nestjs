import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { VoucherType } from '../../../../../_libs/database/common/variable'
import { StatisticTimeQuery } from './statistic-time.query'

export class StatisticTicketQuery extends StatisticTimeQuery {
  @ApiPropertyOptional()
  @Expose()
  @Type(() => Number)
  @IsEnumValue(VoucherType)
  voucherType: VoucherType
}
