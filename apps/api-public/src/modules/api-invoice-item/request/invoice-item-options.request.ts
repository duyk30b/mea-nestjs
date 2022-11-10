import { ApiPropertyOptional } from '@nestjs/swagger'
import { objectEnum, valuesEnum } from '_libs/common/helpers/typescript.helper'
import { InvoiceItemType } from '_libs/database/common/variable'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, ValidateNested } from 'class-validator'

export class InvoiceItemFilterQuery {
	@ApiPropertyOptional({ name: 'filter[reference_id]' })
	@Expose({ name: 'reference_id' })
	@Type(() => Number)
	@IsNumber()
	referenceId: number

	@ApiPropertyOptional({ name: 'filter[customer_id]' })
	@Expose({ name: 'customer_id' })
	@Type(() => Number)
	@IsNumber()
	customerId: number

	@ApiPropertyOptional({
		name: 'filter[type]',
		enum: valuesEnum(InvoiceItemType),
		description: JSON.stringify(objectEnum(InvoiceItemType)),
	})
	@Expose({ name: 'type' })
	@Type(() => Number)
	@IsEnum(InvoiceItemType)
	type: InvoiceItemType
}

// @ApiExtraModels()
export class InvoiceRelationsQuery {
	@ApiPropertyOptional({ name: 'relations[invoice][customer]', enum: ['true', 'false'] })
	@Expose({ name: 'customer' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	customer: boolean
}

export class ProductBatchRelationsQuery {
	@ApiPropertyOptional({ name: 'relations[product_batch][product]', enum: ['true', 'false'], example: 'false' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	product: boolean
}

export class InvoiceItemRelationsQuery {
	@ApiPropertyOptional({ type: InvoiceRelationsQuery })
	@Expose({ name: 'invoice' })
	@Type(() => InvoiceRelationsQuery)
	@ValidateNested({ each: true })
	invoice: InvoiceRelationsQuery

	@ApiPropertyOptional({ name: 'relations[procedure]' })
	@Expose({ name: 'procedure' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	procedure: boolean

	@ApiPropertyOptional({ type: ProductBatchRelationsQuery })
	@Expose({ name: 'product_batch' })
	@Type(() => ProductBatchRelationsQuery)
	@ValidateNested({ each: true })
	productBatch: ProductBatchRelationsQuery
}

export class InvoiceItemSortQuery extends SortQuery {
}
