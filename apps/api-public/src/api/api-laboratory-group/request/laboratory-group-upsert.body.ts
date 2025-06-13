import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator'

export class LaboratoryGroupBody {
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

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  roomId: number
}

export class LaboratoryGroupUpsertBody extends OmitType(LaboratoryGroupBody, ['id']) { }

export class LaboratoryGroupReplaceAllBody {
  @ApiProperty({ type: LaboratoryGroupBody, isArray: true })
  @Expose()
  @Type(() => LaboratoryGroupBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  laboratoryGroupReplaceAll: LaboratoryGroupBody[]
}
