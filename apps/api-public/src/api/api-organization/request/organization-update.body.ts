import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'

export class OrganizationUpdateBody {
  @ApiPropertyOptional({ example: 'Phòng khám đa khoa Medical' })
  @Expose()
  @IsString()
  name: string

  // @ApiPropertyOptional({ name: 'email', example: 'vm@gmail.com' })
  // @Expose({ name: 'email' })
  // @Validate(IsGmail)
  // @Transform(({ value }: { value: string }) => {
  //     const [mail, domain] = value.split('@')
  //     const mailFormat = mail.replace(/\./g, '').replace(/\+.*?$/g, '')
  //     return `${mailFormat}@${domain}`
  // })
  // email: string

  @ApiPropertyOptional({ example: 'Tỉnh Lâm Đồng' })
  @Expose()
  @IsString()
  addressProvince: string

  @ApiPropertyOptional({ example: 'Huyện Cát Tiên' })
  @Expose()
  @IsString()
  addressDistrict: string

  @ApiPropertyOptional({ example: 'Xã Tiên Hoàng' })
  @Expose()
  @IsString()
  addressWard: string

  @ApiPropertyOptional({ example: 'Thôn Trần Lệ Mai' })
  @Expose()
  @IsString()
  addressStreet: string
}
