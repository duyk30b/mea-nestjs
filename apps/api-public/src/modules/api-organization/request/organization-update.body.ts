import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsGmail } from '_libs/common/validate/class-validator.custom'
import { Expose, Transform } from 'class-transformer'
import { IsString, Validate } from 'class-validator'

export class OrganizationUpdateBody {
	@ApiPropertyOptional({ name: 'organization_name', example: 'Phòng khám đa khoa Việt Mỹ' })
	@Expose({ name: 'organization_name' })
	@IsString()
	organizationName: string

	// @ApiPropertyOptional({ name: 'email', example: 'vm@gmail.com' })
	// @Expose({ name: 'email' })
	// @Validate(IsGmail)
	// @Transform(({ value }: { value: string }) => {
	// 	const [mail, domain] = value.split('@')
	// 	const mailFormat = mail.replace(/\./g, '').replace(/\+.*?$/g, '')
	// 	return `${mailFormat}@${domain}`
	// })
	// email: string

	@ApiPropertyOptional({ example: 'Tỉnh Lâm Đồng' })
	@Expose({ name: 'address_province' })
	@IsString()
	addressProvince: string

	@ApiPropertyOptional({ example: 'Huyện Cát Tiên' })
	@Expose({ name: 'address_district' })
	@IsString()
	addressDistrict: string

	@ApiPropertyOptional({ example: 'Xã Tiên Hoàng' })
	@Expose({ name: 'address_ward' })
	@IsString()
	addressWard: string

	@ApiPropertyOptional({ example: 'Thôn Trần Lệ Mai' })
	@Expose({ name: 'address_street' })
	@IsString()
	addressStreet: string
}
