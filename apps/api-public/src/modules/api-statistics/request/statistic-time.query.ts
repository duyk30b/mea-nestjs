import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { LimitQuery } from 'apps/api-public/src/common/query'
import { Expose, Type } from 'class-transformer'
import { IsDate, IsDefined, IsIn } from 'class-validator'

export class StatisticTimeQuery extends LimitQuery {
    @ApiProperty()
    @Expose()
    @Type(() => Date)
    @IsDefined()
    @IsDate()
    fromTime: Date

    @ApiProperty()
    @Expose()
    @Type(() => Date)
    @IsDefined()
    @IsDate()
    toTime: Date

    @ApiPropertyOptional()
    @Expose()
    @IsIn(['date', 'month'])
    timeType: 'date' | 'month'
}
