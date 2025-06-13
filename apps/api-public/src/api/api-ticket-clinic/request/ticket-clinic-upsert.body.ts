import { ApiProperty, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { TicketStatus, TicketType } from '../../../../../_libs/database/entities/ticket.entity'
import { CustomerCreateBody } from '../../api-customer/request'
import { TicketUserBasicBody } from '../api-ticket-clinic-user/request/ticket-clinic-update-user-list.body'

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

class TicketInformationCreateBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roomId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerSourceId: number

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

  @ApiProperty({ example: TicketType.Clinic })
  @Expose()
  @IsDefined()
  @IsEnumValue(TicketType)
  ticketType: TicketType

  @ApiProperty({ example: TicketType.Clinic })
  @Expose()
  @IsDefined()
  @IsIn([TicketStatus.Draft, TicketStatus.Executing])
  status: TicketStatus

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  registeredAt: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsNumber()
  customType: number
}

class TicketInformationUpdateBody extends PickType(TicketInformationCreateBody, [
  'customerSourceId',
  'registeredAt',
  'customType',
]) { }

export class TicketClinicCreateBody {
  @ApiProperty({ type: TicketAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketAttributeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketAttributeList: TicketAttributeBody[]

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBasicBody[]

  @ApiProperty({ type: CustomerCreateBody })
  @Expose()
  @Type(() => CustomerCreateBody)
  @ValidateNested({ each: true })
  customer: CustomerCreateBody

  @ApiProperty({ type: TicketInformationCreateBody })
  @Expose()
  @Type(() => TicketInformationCreateBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketInformation: TicketInformationCreateBody
}

export class TicketClinicUpdateBody {
  @ApiProperty({ type: TicketAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketAttributeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketAttributeList: TicketAttributeBody[]

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketInformationUpdateBody })
  @Expose()
  @Type(() => TicketInformationUpdateBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketInformation: TicketInformationUpdateBody
}
