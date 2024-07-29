import { ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'
import { SingleFileUpload } from '../../../../../_libs/common/dto/file'

export class OrganizationUpdateInfoAndLogoBody extends SingleFileUpload {
  @ApiPropertyOptional({ example: 'Phòng khám đa khoa Medical' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string

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
}

export class OrganizationUpdateInfoBody extends OmitType(OrganizationUpdateInfoAndLogoBody, ['file']) { }