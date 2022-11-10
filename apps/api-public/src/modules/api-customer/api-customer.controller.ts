import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiCustomerService } from './api-customer.service'
import {
	CustomerCreateBody, CustomerGetManyQuery,
	CustomerGetOneQuery, CustomerPaginationQuery, CustomerUpdateBody,
} from './request'

@ApiTags('Customer')
@ApiBearerAuth('access-token')
@Controller('customer')
export class ApiCustomerController {
	constructor(private readonly apiCustomerService: ApiCustomerService) { }

	@Get('pagination')
	pagination(@OrganizationId() oid: number, @Query() query: CustomerPaginationQuery) {
		return this.apiCustomerService.pagination(oid, query)
	}

	@Get('list')
	list(@OrganizationId() oid: number, @Query() query: CustomerGetManyQuery) {
		return this.apiCustomerService.getMany(oid, query)
	}

	@Get('detail/:id')
	async detail(@OrganizationId() oid: number, @Param() { id }: IdParam, @Query() query: CustomerGetOneQuery) {
		return await this.apiCustomerService.getOne(oid, id, query)
	}

	@Post('create')
	async create(@OrganizationId() oid: number, @Body() body: CustomerCreateBody) {
		return await this.apiCustomerService.createOne(oid, body)
	}

	@Patch('update/:id')
	async update(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: CustomerUpdateBody) {
		return await this.apiCustomerService.updateOne(oid, +id, body)
	}
}
