import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsPhone } from '_libs/common/validate/class-validator.custom'
import { EGender } from '_libs/database/common/variable'
import { Expose } from 'class-transformer'
import { IsBoolean, IsDefined, IsIn, IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator'

export class CustomerCreateBody {
	@ApiProperty({ name: 'full_name_vi', example: 'Phạm Hoàng Mai' })
	@Expose({ name: 'full_name_vi' })
	@IsDefined()
	@IsNotEmpty()
	fullNameVi: string

	@ApiProperty({ name: 'full_name_en', example: 'Pham Hoang Mai' })
	@Expose({ name: 'full_name_en' })
	@IsDefined()
	@IsNotEmpty()
	fullNameEn: string

	@ApiPropertyOptional({ name: 'phone', example: '0986123456' })
	@Expose({ name: 'phone' })
	@Validate(IsPhone)
	phone: string

	@ApiPropertyOptional({ name: 'birthday', example: 1678890707005 })
	@Expose({ name: 'birthday' })
	@IsNumber()
	birthday: number

	@ApiPropertyOptional({ name: 'gender', enum: [0, 1], example: EGender.Female })
	@Expose({ name: 'gender' })
	@IsIn([0, 1])
	gender: EGender

	@ApiPropertyOptional({ name: 'identity_card', example: '0330400025442' })
	@Expose({ name: 'identity_card' })                                   // số căn cước công dân
	@IsString()
	identityCard: string

	@ApiPropertyOptional({ name: 'address_province', example: 'Tỉnh Hưng Yên' })
	@Expose({ name: 'address_province' })
	@IsString()
	addressProvince: string

	@ApiPropertyOptional({ name: 'address_district', example: 'Huyện Khoái Châu' })
	@Expose({ name: 'address_district' })
	@IsString()
	addressDistrict: string

	@ApiPropertyOptional({ name: 'address_ward', example: 'Xã Dạ Trạch' })
	@Expose({ name: 'address_ward' })
	@IsString()
	addressWard: string

	@ApiPropertyOptional({ name: 'address_street', example: 'Thôn Đức Nhuận' })
	@Expose({ name: 'address_street' })
	@IsString()
	addressStreet: string

	@ApiPropertyOptional({ name: 'relative', example: 'Mẹ Nguyễn Thị Hương, sđt: 0988021146' })
	@Expose({ name: 'relative' })                                       // người thân
	@IsString()
	relative?: string

	@ApiPropertyOptional({ name: 'health_history', example: 'Mổ ruột thừa năm 2018' })
	@Expose({ name: 'health_history' })
	@IsString()
	healthHistory: string

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng không' })
	@Expose({ name: 'note' })
	note: string
	
	@ApiPropertyOptional({ name: 'is_active', example: true })
	@Expose({ name: 'is_active' })
	@IsBoolean()
	isActive: boolean
}

export class CustomerUpdateBody extends PartialType(CustomerCreateBody) { }
