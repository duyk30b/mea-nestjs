import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsNumber, IsString } from 'class-validator'

export class ReceiptPaymentMoneyBody {
  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  money: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  distributorId: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsString()
  reason: string
}
