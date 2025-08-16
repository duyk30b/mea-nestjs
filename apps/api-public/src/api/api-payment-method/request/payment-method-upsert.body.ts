import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class PaymentMethodCreateBody {
  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsString()
  code: string

  @ApiProperty({ example: 'Tiền mặt' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class PaymentMethodUpdateBody extends PartialType(PaymentMethodCreateBody) { }
