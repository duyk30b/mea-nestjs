import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsIn, IsNumber, IsString, Validate } from 'class-validator'
import {
  IsGmail,
  IsPhone,
} from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class RootOrganizationCreateBody {
  @ApiProperty({ example: '0376899866' })
  @Expose()
  @IsDefined()
  @Validate(IsPhone)
  phone: string

  @ApiPropertyOptional({ name: 'email', example: 'vm@gmail.com' })
  @Expose({ name: 'email' })
  @Transform(({ value }: { value: string }) => {
    if (!value) return value
    const [mail, domain] = value.split('@')
    const mailFormat = mail.replace(/\./g, '').replace(/\+.*?$/g, '')
    return `${mailFormat}@${domain}`
  })
  @Validate(IsGmail)
  email: string

  @ApiPropertyOptional({ example: 0 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  emailVerify: 0 | 1

  @ApiPropertyOptional({ example: 'Phòng khám đa khoa Medical' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  level: number

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  dataVersion: number

  @ApiPropertyOptional({ example: JSON.stringify([1, 2, 3, 4]) })
  @Expose()
  @Transform(({ value }) => {
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        if (typeof i !== 'number') err.push(`${i} is not number`)
        return i
      })
      if (err.length) return err
      else return JSON.stringify(result)
    } catch (error) {
      return [error.message]
    }
  })
  @IsDefined()
  @IsString({ message: `Validate permissionIds failed: Example: ${JSON.stringify([1, 2, 3, 4])}` })
  permissionIds: string

  @ApiPropertyOptional({ example: 'Tỉnh Lâm Đồng' })
  @Expose()
  @IsDefined()
  @IsString()
  addressProvince: string

  @ApiPropertyOptional({ example: 'Huyện Cát Tiên' })
  @Expose()
  @IsDefined()
  @IsString()
  addressDistrict: string

  @ApiPropertyOptional({ example: 'Xã Tiên Hoàng' })
  @Expose()
  @IsDefined()
  @IsString()
  addressWard: string

  @ApiPropertyOptional({ example: 'Thôn Trần Lệ Mai' })
  @Expose()
  @IsDefined()
  @IsString()
  addressStreet: string

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class RootOrganizationUpdateBody extends RootOrganizationCreateBody { }