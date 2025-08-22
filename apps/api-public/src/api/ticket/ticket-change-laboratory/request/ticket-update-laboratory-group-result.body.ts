import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator'

export class LaboratoryGroupResultBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  id: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  laboratoryId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  ticketLaboratoryId: number

  @ApiProperty({ example: 'Âm tính' })
  @Expose()
  @IsDefined()
  @IsString()
  result: string

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  attention: number
}

export class TicketUpdateLaboratoryGroupResultBody {
  @ApiProperty({ type: LaboratoryGroupResultBody, isArray: true })
  @Expose()
  @Type(() => LaboratoryGroupResultBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryResultUpdateList: LaboratoryGroupResultBody[]

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsInt()
  startedAt: number
}
