import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsOptional, IsString } from 'class-validator'
import { IsEnumValue, IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { AppointmentStatus, AppointmentType } from '../../../../../_libs/database/entities/appointment.entity'

export class AppointmentCreateBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  customerId: number

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number

  @ApiPropertyOptional({ example: 'Khách hàng đến chăm sóc da' })
  @Expose()
  @IsString()
  note: string

  @ApiPropertyOptional({ example: AppointmentType.CustomerInitiated })
  @Expose()
  @IsOptional()
  @IsEnumValue(AppointmentType)
  appointmentType: AppointmentType

  @ApiPropertyOptional({ example: AppointmentStatus.Confirm })
  @Expose()
  @IsOptional()
  @IsEnumValue(AppointmentStatus)
  appointmentStatus: AppointmentStatus
}

export class AppointmentUpdateBody extends PartialType(AppointmentCreateBody) { }
