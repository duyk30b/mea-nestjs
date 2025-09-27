import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsInt, IsNumber, IsString } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { TicketParams } from '../../ticket-query/request/ticket.params'

export class TicketChangeUserParams extends TicketParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketUserId: string
}

export class TicketUserBasicBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  positionId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  userId: number
}
