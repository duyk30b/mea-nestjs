import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'

export class TicketChangeProcedureParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketProcedureId: string
}

export class TicketChangeRegimenParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketRegimenId: string
}

export class TicketChangeRegimenItemParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketRegimenItemId: string
}
