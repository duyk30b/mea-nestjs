import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'

export class AppointmentRegisterTicketBody {
  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number
}
