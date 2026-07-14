import { IsEnumValue } from '@libs/common/transform-validate/class-validator.custom'
import { AppointmentStatus } from '@libs/database/entities/appointment.entity'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { CustomerCreateBody } from '../../customer/request'

export class AppointmentCreateBody {
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

  @ApiPropertyOptional({ example: AppointmentStatus.Confirm })
  @Expose()
  @IsEnumValue(AppointmentStatus)
  @IsIn([AppointmentStatus.Waiting, AppointmentStatus.Confirm])
  status: AppointmentStatus

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number

  @ApiPropertyOptional({ example: 'Khách hàng đến chăm sóc da' })
  @Expose()
  @IsString()
  reason: string

  @ApiProperty({ example: 0 })
  @Expose()
  @IsOptional()
  @IsString()
  fromTicketId: string
}

export class AppointmentUpdateBody {
  @ApiPropertyOptional({ example: AppointmentStatus.Confirm })
  @Expose()
  @IsEnumValue(AppointmentStatus)
  @IsIn([AppointmentStatus.Waiting, AppointmentStatus.Confirm, AppointmentStatus.Cancelled])
  status: AppointmentStatus

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number

  @ApiPropertyOptional({ example: 'Khách hàng đến chăm sóc da' })
  @Expose()
  @IsString()
  reason: string

  @ApiPropertyOptional({ example: 'Khách hàng thay đổi kế hoạch' })
  @Expose()
  @IsOptional()
  @IsString()
  cancelReason: string
}
