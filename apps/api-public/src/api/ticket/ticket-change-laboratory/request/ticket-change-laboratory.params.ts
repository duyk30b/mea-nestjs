import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'

export class TicketChangeLaboratoryParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketLaboratoryId: string
}

export class TicketChangeLaboratoryGroupParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketLaboratoryGroupId: string
}
