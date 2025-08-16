import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import { DiscountUpdateBody } from '../../api-discount/request'
import { PositionBasicBody } from '../../api-position/request'

export class RegimenCreate {
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

  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number // Giá dịch vụ

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1
}
export class RegimenItemCreate {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  procedureId: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  gapHoursType: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  gapHours: number
}

export class RegimenCreateBody {
  @ApiProperty({ type: RegimenCreate })
  @Expose()
  @Type(() => RegimenCreate)
  @IsDefined()
  @ValidateNested({ each: true })
  regimen: RegimenCreate

  @ApiProperty({ type: RegimenItemCreate, isArray: true })
  @Expose()
  @Type(() => RegimenItemCreate)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  regimenItemList: RegimenItemCreate[]

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionList: PositionBasicBody[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]
}

export class RegimenUpdateBody extends PartialType(RegimenCreateBody) { }