import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'

export class VisitPaymentBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  visitId: number

  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  money: number
}
