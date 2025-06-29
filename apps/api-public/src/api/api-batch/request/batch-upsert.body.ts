import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsInt, IsNumber, IsString } from 'class-validator'

export class BatchInsertBody {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  productId: number

  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  warehouseId: number

  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  distributorId: number

  @ApiPropertyOptional({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  lotNumber: string

  @ApiPropertyOptional({ example: 1679995369195 })
  @Expose()
  // @IsDefined() //expiryDate được phép null
  @IsInt()
  expiryDate: number

  @ApiPropertyOptional({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  costPrice: number

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class BatchUpdateInfoBody extends PickType(BatchInsertBody, [
  'lotNumber',
  'expiryDate',
  'warehouseId',
]) { }

export class BatchUpdateInfoAndQuantityBody extends PickType(BatchInsertBody, [
  'lotNumber',
  'expiryDate',
  'warehouseId',
  'distributorId',
  'costPrice',
  'isActive',
]) {
  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  costAmount: number
}
