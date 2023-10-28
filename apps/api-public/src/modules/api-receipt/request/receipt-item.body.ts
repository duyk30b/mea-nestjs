import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsNumber, Min, ValidateNested } from 'class-validator'
import { UnitConversionQuery } from '../../api-product/request'

export class ReceiptItemBody {
    @ApiPropertyOptional({ name: 'product_batch_id', example: 52 })
    @Expose({ name: 'product_batch_id' })
    @IsDefined()
    @IsNumber()
    productBatchId: number

    // @ApiPropertyOptional({ name: 'unit', type: 'string', example: '{"name":"Viên","rate":1}' })
    // @Expose({ name: 'unit' })
    // @Transform(({ value }) => {
    // 	try {
    // 		const instance = Object.assign(new UnitConversionQuery(), JSON.parse(value))
    // 		const validate = validateSync(instance, { whitelist: true, forbidNonWhitelisted: true })
    // 		if (validate.length) return validate
    // 		else return JSON.stringify(instance)
    // 	}
    // 	catch (error) { return [error.message] }
    // })
    // @IsString({ message: 'Validate unit failed: Example: {"name":"Viên","rate":1}' })
    // unit: string

    @ApiPropertyOptional({ name: 'unit', type: UnitConversionQuery, example: { name: 'Viên', rate: 1 } })
    @Expose({ name: 'unit' })
    @Type(() => UnitConversionQuery)
    @IsDefined()
    @ValidateNested({ each: true })
    unit: UnitConversionQuery

    @ApiProperty({ name: 'quantity', example: 4 })
    @Expose({ name: 'quantity' })
    @IsDefined()
    @IsNumber()
    @Min(1)
    quantity: number
}