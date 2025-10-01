import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsIn, IsInt, IsString, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { ProcedureType } from '../../../../../../_libs/database/entities/procedure.entity'
import { DiscountUpdateBody } from '../../discount/request'
import { PositionBasicBody } from '../../position/request'

export class ProcedureCreate {
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

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  procedureGroupId: number

  @ApiProperty({ example: ProcedureType.Basic })
  @Expose()
  @IsEnumValue(ProcedureType)
  procedureType: ProcedureType

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

export class ProcedureUpsertBody {
  @ApiProperty({ type: ProcedureCreate })
  @Expose()
  @Type(() => ProcedureCreate)
  @IsDefined()
  @ValidateNested({ each: true })
  procedure: ProcedureCreate

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionRequestList: PositionBasicBody[]

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionResultList: PositionBasicBody[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]
}
