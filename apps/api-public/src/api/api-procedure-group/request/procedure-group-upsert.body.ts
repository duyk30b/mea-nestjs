import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class ProcedureGroupCreateBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string
}

export class ProcedureGroupUpdateBody extends PartialType(ProcedureGroupCreateBody) { }
