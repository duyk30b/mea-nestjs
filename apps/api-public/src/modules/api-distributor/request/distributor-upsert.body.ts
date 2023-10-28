import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsBoolean, IsDefined, IsNotEmpty, IsString, Validate } from 'class-validator'
import { IsPhone } from '_libs/common/validate/class-validator.custom'

export class DistributorCreateBody {
	@ApiProperty({ name: 'full_name', example: 'Ngô Nhật Dương' })
	@Expose({ name: 'full_name' })
	@IsDefined()
	@IsNotEmpty()
	fullName: string

	@ApiProperty({ name: 'phone', default: '0986123456' })
	@Expose({ name: 'phone' })
	@Validate(IsPhone)
	phone: string

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

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng không' })
	@Expose({ name: 'note' })
	note: string

	@ApiPropertyOptional({ name: 'is_active', example: true })
	@Expose({ name: 'is_active' })
	@IsBoolean()
	isActive: boolean
}

export class DistributorUpdateBody extends PartialType(DistributorCreateBody) { }
