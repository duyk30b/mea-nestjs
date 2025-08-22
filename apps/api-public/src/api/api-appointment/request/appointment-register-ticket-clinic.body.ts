import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'

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
}
