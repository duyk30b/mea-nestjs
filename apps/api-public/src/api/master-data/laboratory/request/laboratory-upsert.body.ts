import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { LaboratoryValueType } from '../../../../../../_libs/database/entities/laboratory.entity'
import { DiscountUpdateBody } from '../../discount/request'
import { PositionBasicBody } from '../../position/request'

export class LaboratoryParentUpsert {
  @ApiProperty({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  laboratoryCode?: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  laboratoryGroupId: number

  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  priority: number

  @ApiProperty({ example: 'GOT' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string

  @ApiPropertyOptional({ example: 50000 })
  @Expose()
  @IsDefined()
  @IsInt()
  costPrice: number

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  lowValue: number

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  highValue: number

  @ApiProperty({ enum: LaboratoryValueType, example: LaboratoryValueType.Number })
  @Expose()
  @IsDefined()
  @IsEnumValue(LaboratoryValueType)
  valueType: LaboratoryValueType

  @ApiProperty({ example: 'mg/l' })
  @Expose()
  @IsDefined()
  @IsString()
  unit: string

  @ApiProperty({ example: 'mg/l' })
  @Expose()
  @IsDefined()
  @IsString()
  options: string
}

export class LaboratoryChildCreate extends OmitType(LaboratoryParentUpsert, [
  'laboratoryGroupId',
  'laboratoryCode',
]) { }
export class LaboratoryChildUpdate extends OmitType(LaboratoryParentUpsert, [
  'laboratoryGroupId',
  'laboratoryCode',
  'costPrice',
  'price',
]) {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  id: number
}

export class LaboratoryCreateBody {
  @ApiProperty({ type: LaboratoryParentUpsert })
  @Expose()
  @Type(() => LaboratoryParentUpsert)
  @IsDefined()
  @ValidateNested({ each: true })
  laboratory: LaboratoryParentUpsert

  @ApiProperty({ type: LaboratoryChildCreate, isArray: true })
  @Expose()
  @Type(() => LaboratoryChildCreate)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  laboratoryChildren: LaboratoryChildCreate[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionRequestList: PositionBasicBody[]
}

export class LaboratoryUpdateBody {
  @ApiProperty({ type: LaboratoryParentUpsert })
  @Expose()
  @Type(() => LaboratoryParentUpsert)
  @IsDefined()
  @ValidateNested({ each: true })
  laboratory: LaboratoryParentUpsert

  @ApiProperty({ type: LaboratoryChildUpdate, isArray: true })
  @Expose()
  @Type(() => LaboratoryChildUpdate)
  @IsOptional()
  @ValidateNested({ each: true })
  laboratoryChildren: LaboratoryChildUpdate[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionRequestList: PositionBasicBody[]
}
