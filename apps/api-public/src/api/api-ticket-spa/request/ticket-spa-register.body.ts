import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsPositive, IsString } from 'class-validator'

export class TicketSpaRegister {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsPositive()
  customerId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  fromAppointmentId: number

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  registeredAt: number

  @ApiProperty({ example: 'Khách hàng đến chăm sóc da' })
  @Expose()
  @IsString()
  reason: string
}
