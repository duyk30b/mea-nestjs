import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsNumber, IsString } from 'class-validator'

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
]) {
  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number
}
