import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsBoolean, IsDefined, IsNumber, IsString, ValidateNested, validateSync } from 'class-validator'

export class UnitConversionQuery {
	@Expose({ name: 'name' })
	@IsDefined()
	@IsString()
	name: string

	@Expose({ name: 'rate' })
	@IsDefined()
	@IsNumber()
	rate: number
}

export class ProductCreateBody {
	@ApiProperty({ name: 'brand_name', example: 'Klacid 125mg/5ml' })
	@Expose({ name: 'brand_name' })
	@IsDefined()
	@IsString()
	brandName: string                              // tên biệt dược

	@ApiPropertyOptional({ name: 'substance', example: 'Clarythromycin 125mg/5ml' })
	@Expose({ name: 'substance' })
	@IsString()
	substance: string                             // Hoạt chất

	@ApiPropertyOptional({ name: 'group', example: '2' })
	@Expose({ name: 'group' })
	@IsString()
	group: string                                  // nhóm thuốc: kháng sinh, dinh dưỡng ...

	@ApiPropertyOptional({ name: 'unit', type: 'string', example: '[{"name":"Viên","rate":1}]' })
	@Expose({ name: 'unit' })
	@Transform(({ value }) => {
		try {
			const err = []
			const result = JSON.parse(value).map((i: any) => {
				const instance = Object.assign(new UnitConversionQuery(), i)
				const validate = validateSync(instance, { whitelist: true, forbidNonWhitelisted: true })
				if (validate.length) err.push(...validate)
				return instance
			})
			if (err.length) return err
			else return JSON.stringify(result)
		}
		catch (error) { return [error.message] }
	})
	@IsString({ message: 'Validate unit failed: Example: [{"name":"Viên","rate":1}]' })
	unit: string                                   // đơn vị tính: lọ, ống, vỉ

	// @ApiPropertyOptional({ name: 'unit', type: 'string', example: '[{"name":"Viên","rate":1}]' })
	// @Expose({ name: 'unit' })
	// @Transform(({ value }) => {
	// 	if (value == null) return [{ name: '', rate: 1 }]
	// 	try { return JSON.parse(value).map((i: any) => Object.assign(new UnitConversionQuery(), i)) }
	// 	catch (error) { return error.message }
	// })
	// @IsArray()
	// @ValidateNested({ each: true })
	// unit: UnitConversionQuery[]

	@ApiPropertyOptional({ name: 'route', example: 'Uống' })
	@Expose({ name: 'route' })
	@IsString()
	route: string                                  // Đường dùng      

	@ApiPropertyOptional({ name: 'source', example: 'Ấn Độ' })
	@Expose({ name: 'source' })
	@IsString()
	source: string                                  // Nguồn gốc 

	@ApiPropertyOptional({ name: 'image', example: 'https://cdn.medigoapp.com/product/Klacid_125mg_5ml_4724e139c8.jpg' })
	@Expose({ name: 'image' })
	@IsString()
	image: string

	@ApiPropertyOptional({ name: 'hint_usage', example: 'Uống 1 viên/ngày, 9h sáng, sau ăn no' })
	@Expose({ name: 'hint_usage' })
	@IsString()
	hintUsage: string                                  // Nguồn gốc 

	@ApiPropertyOptional({ name: 'is_active', example: true })
	@Expose({ name: 'is_active' })
	@IsBoolean()
	isActive: boolean
}

export class ProductUpdateBody extends PartialType(ProductCreateBody) { }
