import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsNumber, IsString } from 'class-validator'

export class RootOrganizationPaymentMoneyBody {
  @ApiPropertyOptional({})
  @Expose()
  @IsString()
  note: string

  @Expose()
  @IsDefined()
  @IsNumber()
  money: number

  @ApiPropertyOptional({})
  @Expose()
  @IsDefined()
  @IsInt()
  createdAt: number

  @ApiPropertyOptional({})
  @Expose()
  @IsDefined()
  @IsInt()
  expiryAt: number
}
