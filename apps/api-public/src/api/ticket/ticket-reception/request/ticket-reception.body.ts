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
import { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { CustomerCreateBody } from '../../../api-customer/request'
import { TicketProcedureWrapBody } from '../../ticket-change-procedure/request'
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

class TicketReceptionCreate {
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

  @ApiProperty({ example: TicketStatus.Draft })
  @Expose()
  @IsDefined()
  @IsIn([TicketStatus.Draft, TicketStatus.Executing])
  status: TicketStatus

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  registeredAt: number

  @ApiProperty({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
  @Expose()
  @IsDefined()
  @IsString()
  note: string
}

class TicketReceptionUpdate extends PickType(TicketReceptionCreate, [
  'roomId',
  'customerSourceId',
  'registeredAt',
  'note',
]) { }

export class TicketReceptionCreateTicketBody {
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
  ticketUserReceptionList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketProcedureWrapBody, isArray: true })
  @Expose()
  @Type(() => TicketProcedureWrapBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureWrapList?: TicketProcedureWrapBody[]

  @ApiProperty({ type: CustomerCreateBody })
  @Expose()
  @Type(() => CustomerCreateBody)
  @ValidateNested({ each: true })
  customer: CustomerCreateBody

  @ApiProperty({ type: TicketReceptionCreate })
  @Expose()
  @Type(() => TicketReceptionCreate)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketReception: TicketReceptionCreate
}

export class TicketReceptionUpdateTicketBody {
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
  ticketUserReceptionList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketReceptionUpdate })
  @Expose()
  @Type(() => TicketReceptionUpdate)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketReception: TicketReceptionUpdate
}
