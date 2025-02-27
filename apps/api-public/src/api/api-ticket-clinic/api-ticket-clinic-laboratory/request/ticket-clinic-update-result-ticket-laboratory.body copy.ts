import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsString,
  ValidateNested,
} from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'

export class TicketLaboratoryUpdateResult {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  id: number

  @ApiProperty({ example: JSON.stringify({ 1: true }) })
  @Expose()
  @IsDefined()
  @IsString()
  attention: string

  @ApiProperty({ example: JSON.stringify({ 2: 'Âm tính' }) })
  @Expose()
  @IsDefined()
  @IsString()
  result: string
}

export class TicketLaboratoryUpdateResultBody {
  @ApiProperty({ type: TicketLaboratoryUpdateResult, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryUpdateResult)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryUpdateList: TicketLaboratoryUpdateResult[]

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsInt()
  startedAt: number
}
