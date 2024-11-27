import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsIn, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, Validate, ValidateNested } from 'class-validator'
import { IsEnumValue, IsPhone } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { EGender } from '../../../../../_libs/database/common/variable'
import { TicketStatus, TicketType } from '../../../../../_libs/database/entities/ticket.entity'

class TicketAttributeBody {
  @ApiProperty({ example: 'Diagnosis' })
  @Expose()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  key: string

  @ApiProperty()
  @Expose()
  @IsString()
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

export class CustomerBody {
  @ApiProperty({ example: 'Phạm Hoàng Mai' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  fullName: string

  @ApiPropertyOptional({ example: '0986123456' })
  @Expose()
  @Validate(IsPhone)
  phone: string

  @ApiPropertyOptional({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  birthday: number

  @ApiPropertyOptional({ enum: [0, 1], example: EGender.Female })
  @Expose()
  @IsIn([0, 1])
  gender: EGender

  @ApiPropertyOptional({ example: 'Tỉnh Hưng Yên' })
  @Expose()
  @IsString()
  addressProvince: string

  @ApiPropertyOptional({ example: 'Huyện Khoái Châu' })
  @Expose()
  @IsString()
  addressDistrict: string

  @ApiPropertyOptional({ example: 'Xã Dạ Trạch' })
  @Expose()
  @IsString()
  addressWard: string

  @ApiPropertyOptional({ example: 'Thôn Đức Nhuận' })
  @Expose()
  @IsString()
  addressStreet: string

  @ApiPropertyOptional({ example: 'Mẹ Nguyễn Thị Hương, sđt: 0988021146' })
  @Expose() // người thân
  @IsString()
  relative: string

  @ApiPropertyOptional({ example: 'Mổ ruột thừa năm 2018' })
  @Expose()
  @IsString()
  healthHistory: string

  @ApiPropertyOptional({ example: 'Khách hàng khó tính' })
  @Expose()
  @IsString()
  note: string
}

export class TicketClinicCreateBody {
  @ApiProperty({ type: TicketAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketAttributeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketAttributeList: TicketAttributeBody[]

  @ApiProperty({ type: CustomerBody })
  @Expose()
  @Type(() => CustomerBody)
  @ValidateNested({ each: true })
  customer: CustomerBody

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
