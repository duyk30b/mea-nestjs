import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { LaboratoryValueType } from '../../../../../_libs/database/entities/laboratory.entity'

export class LaboratoryParentCreate {
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

export class LaboratoryCreateChild extends OmitType(LaboratoryParentCreate, ['laboratoryGroupId']) { }

export class LaboratoryCreateBody extends LaboratoryParentCreate {
  @ApiProperty({ type: LaboratoryCreateChild, isArray: true })
  @Expose()
  @Type(() => LaboratoryCreateChild)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  children: LaboratoryCreateChild[]
}

export class LaboratoryParentUpdate extends OmitType(LaboratoryParentCreate, ['valueType']) { }
export class LaboratoryUpdateChild extends OmitType(LaboratoryParentCreate, ['laboratoryGroupId']) {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  id: number
}

export class LaboratoryUpdateBody extends LaboratoryParentUpdate {
  @ApiProperty({ type: LaboratoryUpdateChild, isArray: true })
  @Expose()
  @Type(() => LaboratoryUpdateChild)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  children: LaboratoryUpdateChild[]
}
