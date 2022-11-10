import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiProductBatchService } from './api-product-batch.service'
import { ProductBatchGetOneQuery, ProductBatchInsertBody, ProductBatchPaginationQuery, ProductBatchUpdateBody } from './request'

@ApiTags('Product Batch')
@ApiBearerAuth('access-token')
@Controller('product-batch')
export class ApiProductBatchController {
	constructor(private readonly apiProductBatchService: ApiProductBatchService) { }

	@Get('pagination')
	pagination(@OrganizationId() oid: number, @Query() query: ProductBatchPaginationQuery) {
		return this.apiProductBatchService.pagination(oid, query)
	}

	@Get('detail/:id')
	async detail(@OrganizationId() oid: number, @Param() { id }: IdParam, @Query() query: ProductBatchGetOneQuery) {
		return await this.apiProductBatchService.getOne(oid, id, query)
	}

	@Post('create')
	async create(@OrganizationId() oid: number, @Body() body: ProductBatchInsertBody) {
		return await this.apiProductBatchService.createOne(oid, body)
	}

	@Patch('update/:id')
	async update(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: ProductBatchUpdateBody) {
		return await this.apiProductBatchService.updateOne(oid, id, body)
	}

	@Delete('delete/:id')
	async delete(@OrganizationId() oid: number, @Param() { id }: IdParam) {
		return await this.apiProductBatchService.deleteOne(oid, id)
	}
}
