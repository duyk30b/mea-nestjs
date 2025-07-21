import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsString } from 'class-validator'

export class DistributorRefundBody {
  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  distributorId: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  receiptId: number

  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  money: number

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
