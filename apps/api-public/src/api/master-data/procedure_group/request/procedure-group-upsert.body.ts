import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'

export class ProcedureGroupCreateBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string
}

export class ProcedureGroupUpdateBody extends PartialType(ProcedureGroupCreateBody) { }

export class ProcedureGroupReplaceBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  id: number
}

export class ProcedureGroupReplaceAllBody {
  @ApiProperty({ type: ProcedureGroupReplaceBody, isArray: true })
  @Expose()
  @Type(() => ProcedureGroupReplaceBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  procedureGroupReplaceAll: ProcedureGroupReplaceBody[]
}
