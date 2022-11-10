import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsBoolean, IsDefined, IsNumber, IsString } from 'class-validator'

export class ProcedureCreateBody {
	@ApiProperty({ name: 'name_vi', example: 'Truyền dịch 500ml' })
	@Expose({ name: 'name_vi' })
	@IsDefined()
	@IsString()
	nameVi: string                                 // tên dịch vụ

	@ApiProperty({ name: 'name_en', example: 'Truyen dich 500ml' })
	@Expose({ name: 'name_en' })
	@IsDefined()
	@IsString()
	nameEn: string                                 // tên dịch vụ

	@ApiPropertyOptional({ name: 'group', example: 'Tiêm truyền' })
	@Expose({ name: 'group' })
	@IsString()
	group: string                                   // nhóm dịch vụ

	@ApiPropertyOptional({ name: 'price', example: 105000 })
	@Expose({ name: 'price' })
	@IsNumber()
	price: number                                   // Giá dịch vụ

	@ApiProperty({ name: 'consumable_hint' })
	@Expose({ name: 'consumable_hint' })
	@IsString()
	consumableHint: string                          // Vật tư tiêu hao sử dụng

	@ApiPropertyOptional({ name: 'is_active', example: true })
	@Expose({ name: 'is_active' })
	@IsBoolean()
	isActive: boolean
}

export class ProcedureUpdateBody extends PartialType(ProcedureCreateBody) { }
