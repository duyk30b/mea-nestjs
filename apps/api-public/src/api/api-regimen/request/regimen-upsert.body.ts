import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsString,
  ValidateNested,
} from 'class-validator'
import { DiscountUpdateBody } from '../../api-discount/request'
import { PositionBasicBody } from '../../api-position/request'

export class RegimenItemBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  procedureId: number

  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  quantity: number // Giá dịch vụ

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsInt()
  gapDay: number // Giá dịch vụ
}

export class RegimenBody {
  @ApiProperty({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  code: string

  @ApiProperty({ example: 'Truyền dịch 500ml' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string // tên dịch vụ

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class RegimenUpsertWrapBody {
  @ApiProperty({ type: RegimenBody })
  @Expose()
  @Type(() => RegimenBody)
  @IsDefined()
  @ValidateNested({ each: true })
  regimen: RegimenBody

  @ApiProperty({ type: RegimenItemBody, isArray: true })
  @Expose()
  @Type(() => RegimenItemBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  regimenItemList: RegimenItemBody[]

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionRequestList: PositionBasicBody[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]
}
