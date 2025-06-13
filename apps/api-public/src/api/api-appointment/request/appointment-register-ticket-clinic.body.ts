import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { TicketType } from '../../../../../_libs/database/entities/ticket.entity'

export class AppointmentRegisterTicketClinicBody {
  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roomId: number

  @ApiProperty({ example: TicketType.Clinic })
  @Expose()
  @IsDefined()
  @IsEnumValue(TicketType)
  ticketType: TicketType
}
