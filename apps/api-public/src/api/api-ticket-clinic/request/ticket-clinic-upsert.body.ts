import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsIn, IsNotEmpty, IsNumber, IsString, MaxLength, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { RoleInteractType } from '../../../../../_libs/database/entities/commission.entity'
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

class TicketUserBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  userId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roleId: number

  @ApiProperty({ example: RoleInteractType.Ticket })
  @Expose()
  @IsDefined()
  @IsEnumValue(RoleInteractType)
  interactType: RoleInteractType

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  interactId: number
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

  @ApiProperty({ type: TicketUserBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBody[]

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
