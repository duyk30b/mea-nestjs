import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator'
import { CustomerCreateBody } from '../../api-customer/request'

export class TicketEyeRegisterWithNewCustomerBody {
  @ApiProperty({ type: CustomerCreateBody })
  @Expose()
  @Type(() => CustomerCreateBody)
  @IsDefined()
  @ValidateNested({ each: true })
  customer: CustomerCreateBody

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  registeredAt: number
}

export class TicketEyeRegisterWithExistCustomerBody {
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
