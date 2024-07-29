import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { Allow, IsArray, IsDefined, IsIn, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { TicketStatus, TicketType } from '../../../../../_libs/database/entities/ticket.entity'
import { CustomerCreateBody } from '../../api-customer/request'

class TicketAttributeBody {
  @ApiProperty({ example: 'Diagnosis' })
  @Expose()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  key: string

  @ApiProperty()
  @Expose()
  @IsDefined()
  value: string
}

class TicketBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerSourceId: number

  @ApiProperty({ example: TicketType.Clinic })
  @Expose()
  @IsDefined()
  @IsEnumValue(TicketType)
  ticketType: TicketType

  @ApiProperty({ example: TicketType.Clinic })
  @Expose()
  @IsDefined()
  @IsIn([TicketStatus.Draft, TicketStatus.Executing])
  ticketStatus: TicketStatus

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  registeredAt: number
}

export class TicketClinicCreateBody {
  @ApiProperty({ type: TicketAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketAttributeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketAttributeList: TicketAttributeBody[]

  @ApiProperty({ type: CustomerCreateBody })
  @Expose()
  @Type(() => CustomerCreateBody)
  @ValidateNested({ each: true })
  customer: CustomerCreateBody

  @ApiProperty({ type: TicketBody })
  @Expose()
  @Type(() => TicketBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticket: TicketBody

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  fromAppointmentId: number
}
