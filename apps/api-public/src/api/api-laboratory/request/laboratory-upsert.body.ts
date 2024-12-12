import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { LaboratoryValueType } from '../../../../../_libs/database/entities/laboratory.entity'

export class LaboratoryParentUpsert {
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

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  laboratoryGroupId: number

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
]) { }
export class LaboratoryChildUpdate extends OmitType(LaboratoryParentUpsert, ['laboratoryGroupId']) {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  id: number
}

export class LaboratoryCreateBody extends LaboratoryParentUpsert {
  @ApiProperty({ type: LaboratoryChildCreate, isArray: true })
  @Expose()
  @Type(() => LaboratoryChildCreate)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  children: LaboratoryChildCreate[]
}

export class LaboratoryUpdateBody extends LaboratoryParentUpsert {
  @ApiProperty({ type: LaboratoryChildUpdate, isArray: true })
  @Expose()
  @Type(() => LaboratoryChildUpdate)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  children: LaboratoryChildUpdate[]
}
