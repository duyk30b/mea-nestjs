import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsInt } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { TicketParams } from '../../../api-ticket/request/ticket.params'

export class TicketClinicUserParams extends TicketParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  ticketUserId: number
}
