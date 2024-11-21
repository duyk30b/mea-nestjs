import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator'

export class LaboratoryGroupCreateBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  printHtmlId: number
}

export class LaboratoryGroupUpdateBody extends PartialType(LaboratoryGroupCreateBody) { }

export class LaboratoryGroupReplaceBody {
  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  id: number

  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  printHtmlId: number
}

export class LaboratoryGroupReplaceAllBody {
  @ApiProperty({ type: LaboratoryGroupReplaceBody, isArray: true })
  @Expose()
  @Type(() => LaboratoryGroupReplaceBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  laboratoryGroupReplaceAll: LaboratoryGroupReplaceBody[]
}
