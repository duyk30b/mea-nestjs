import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { AppointmentStatus } from '../../../../../_libs/database/entities/appointment.entity'
import { CustomerCreateBody } from '../../api-customer/request'

export class AppointmentBody {
  @ApiProperty({ example: 0 })
  @Expose()
  @IsOptional()
  @IsNumber()
  fromTicketId: number

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number

  @ApiPropertyOptional({ example: 'Khách hàng đến chăm sóc da' })
  @Expose()
  @IsString()
  reason: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerSourceId: number
}

export class AppointmentCreateBody extends AppointmentBody {
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
}

export class AppointmentUpdateBody extends AppointmentBody {
  @ApiPropertyOptional({ example: AppointmentStatus.Confirm })
  @Expose()
  @IsEnumValue(AppointmentStatus)
  @IsIn([AppointmentStatus.Waiting, AppointmentStatus.Confirm, AppointmentStatus.Cancelled])
  status: AppointmentStatus

  @ApiPropertyOptional({ example: 'Khách hàng thay đổi kế hoạch' })
  @Expose()
  @IsOptional()
  @IsString()
  cancelReason: string
}
