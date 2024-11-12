import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsIn, IsInt, IsString, ValidateNested } from 'class-validator'
import { keysEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  AttributeInputType,
  AttributeLayoutType,
} from '../../../../../_libs/database/common/variable'

class PrintHtmlInsert {
  @ApiProperty({ example: 'Truyền dịch 500ml' })
  @Expose()
  @IsDefined()
  @IsString()
  content: string // Dạng HTML
}

class ParaclinicalAttributeInsert {
  @ApiProperty({ example: 'KetLuan' })
  @Expose()
  @IsDefined()
  @IsString()
  code: string

  @ApiProperty({ example: 'Kết Luận' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string

  @ApiProperty({ enum: AttributeInputType, example: AttributeInputType.InputText })
  @Expose()
  @IsDefined()
  @IsEnumValue(AttributeInputType)
  inputType: AttributeInputType

  @ApiProperty({ example: 'Chưa có dấu hiệu bất thường' })
  @Expose()
  @IsString()
  default: string

  @ApiProperty({ example: '[]' })
  @Expose()
  @IsString()
  options: string
}

export class ParaclinicalUpsertBody {
  @ApiProperty({ example: 'Siêu âm tuyến giáp' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string // tên dịch vụ

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  paraclinicalGroupId: number

  @ApiProperty({ example: 'Chưa có dấu hiệu bất thường' })
  @Expose()
  @IsDefined()
  @IsString()
  conclusionDefault: string // tên dịch vụ

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number // Giá dịch vụ

  @ApiProperty({ enum: AttributeInputType, example: <keyof typeof AttributeLayoutType>'Table' })
  @Expose()
  @IsDefined()
  @IsIn(keysEnum(AttributeLayoutType))
  attributeLayout: keyof typeof AttributeLayoutType

  @ApiProperty({ type: ParaclinicalAttributeInsert, isArray: true })
  @Expose()
  @Type(() => ParaclinicalAttributeInsert)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  paraclinicalAttributeList: ParaclinicalAttributeInsert[]

  @ApiProperty({ type: PrintHtmlInsert })
  @Expose()
  @Type(() => PrintHtmlInsert)
  @IsDefined()
  @ValidateNested({ each: true })
  printHtml: PrintHtmlInsert
}

export class ParaclinicalUpdateInfoBody extends OmitType(ParaclinicalUpsertBody, [
  'attributeLayout',
  'paraclinicalAttributeList',
  'printHtml',
]) {
}
