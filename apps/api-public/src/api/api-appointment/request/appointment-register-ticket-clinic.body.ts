import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString } from 'class-validator'

export class AppointmentRegisterTicketClinicBody {
  @ApiProperty({ example: 0 })
  @Expose()
  @IsString()
  toTicketId: string

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsDefined()
  @IsNumber()
  receptionAt: number

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roomId: number

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsDefined()
  @IsNumber()
  isPaymentEachItem: number
}
