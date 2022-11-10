import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsNumber, Max, Min } from 'class-validator'

export class StatisticsRevenueMonthQuery {
	@ApiProperty({ name: 'year' })
	@Expose({ name: 'year' })
	@Type(() => Number)
	@IsDefined()
	@IsNumber()
	year: number

	@ApiProperty({ name: 'month' })
	@Expose({ name: 'month' })
	@Type(() => Number)
	@IsDefined()
	@IsNumber()
	@Min(1)
	@Max(12)
	month: number
}
