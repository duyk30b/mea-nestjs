import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiProductService } from './api-product.service'
import {
	ProductCreateBody,
	ProductGetManyQuery, ProductGetOneQuery,
	ProductPaginationQuery,
	ProductUpdateBody,
} from './request'

@ApiTags('Product')
@ApiBearerAuth('access-token')
@Controller('product')
export class ApiProductController {
	constructor(private readonly apiProductService: ApiProductService) { }

	@Get('pagination')
	pagination(@OrganizationId() oid: number, @Query() query: ProductPaginationQuery) {
		return this.apiProductService.pagination(oid, query)
	}

	@Get('list')
	async list(@OrganizationId() oid: number, @Query() query: ProductGetManyQuery) {
		return await this.apiProductService.getList(oid, query)
	}

	@Get('detail/:id')
	async detail(@OrganizationId() oid: number, @Param() { id }: IdParam, @Query() query: ProductGetOneQuery) {
		return await this.apiProductService.getOne(oid, id, query)
	}

	@Post('create')
	async create(@OrganizationId() oid: number, @Body() body: ProductCreateBody) {
		return await this.apiProductService.createOne(oid, body)
	}

	@Patch('update/:id')
	async update(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: ProductUpdateBody) {
		return await this.apiProductService.updateOne(oid, id, body)
	}
}
