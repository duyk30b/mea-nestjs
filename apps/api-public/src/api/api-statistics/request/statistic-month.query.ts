import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsNumber, Max, Min } from 'class-validator'

export class StatisticMonthQuery {
  @ApiProperty({})
  @Expose()
  @Type(() => Number)
  @IsDefined()
  @IsNumber()
  year: number

  @ApiProperty({})
  @Expose()
  @Type(() => Number)
  @IsDefined()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number
}
