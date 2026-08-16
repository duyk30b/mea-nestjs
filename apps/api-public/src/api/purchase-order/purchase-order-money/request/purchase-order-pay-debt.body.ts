import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator'

class ChangeDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  purchaseOrderId: string

  @Expose()
  @IsDefined()
  @IsNumber()
  paid: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debt: number
}

export class PurchaseOrderPayDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  distributorId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @ApiPropertyOptional({})
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: ChangeDebtBody, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => ChangeDebtBody)
  @IsArray()
  @ValidateNested({ each: true })
  changeDebtList: ChangeDebtBody[]
}
