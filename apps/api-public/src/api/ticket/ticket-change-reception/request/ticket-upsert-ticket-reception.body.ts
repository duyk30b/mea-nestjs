import { ApiProperty } from '@nestjs/swagger'
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
import { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { CustomerCreateBody } from '../../../api-customer/request'
import {
  TicketProcedureWrapBody,
  TicketRegimenWrapBody,
} from '../../ticket-change-procedure/request'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

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

class TicketReceptionBody {
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

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  receptionAt: number

  @ApiProperty({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
  @Expose()
  @IsDefined()
  @IsString()
  reason: string
}

export class TicketCreateTicketReceptionBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsDefined()
  @IsNumber()
  isPaymentEachItem: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerId: number

  @ApiProperty({ type: CustomerCreateBody })
  @Expose()
  @Type(() => CustomerCreateBody)
  @ValidateNested({ each: true })
  customer: CustomerCreateBody

  @ApiProperty({ type: TicketReceptionBody })
  @Expose()
  @Type(() => TicketReceptionBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketReceptionAdd: TicketReceptionBody

  @ApiProperty({ type: TicketAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketAttributeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketAttributeAddList: TicketAttributeBody[]

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserReceptionAddList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketRegimenWrapBody })
  @Expose()
  @Type(() => TicketRegimenWrapBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketRegimenWrapList: TicketRegimenWrapBody[]

  @ApiProperty({ type: TicketProcedureWrapBody })
  @Expose()
  @Type(() => TicketProcedureWrapBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketProcedureWrapList: TicketProcedureWrapBody[]

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  fromAppointmentId: string

  @ApiProperty({ example: TicketStatus.Draft })
  @Expose()
  @IsDefined()
  @IsIn([TicketStatus.Draft, TicketStatus.Executing])
  status: TicketStatus
}

export class TicketUpdateTicketReceptionBody {
  @ApiProperty({ type: TicketAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketAttributeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketAttributeUpdateList: TicketAttributeBody[]

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserReceptionUpdateList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketReceptionBody })
  @Expose()
  @Type(() => TicketReceptionBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketReceptionUpdate: TicketReceptionBody
}
