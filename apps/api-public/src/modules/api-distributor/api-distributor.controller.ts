import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiDistributorService } from './api-distributor.service'
import { DistributorCreateBody, DistributorGetManyQuery, DistributorPaginationQuery, DistributorUpdateBody } from './request'

@ApiTags('Distributor')
@ApiBearerAuth('access-token')
@Controller('distributor')
export class ApiDistributorController {
	constructor(private readonly apiDistributorService: ApiDistributorService) { }

	@Get('pagination')
	pagination(@OrganizationId() oid: number, @Query() query: DistributorPaginationQuery) {
		return this.apiDistributorService.pagination(oid, query)
	}

	@Get('list')
	list(@OrganizationId() oid: number, @Query() query: DistributorGetManyQuery) {
		return this.apiDistributorService.getMany(oid, query)
	}

	@Get('detail/:id')
	findOne(@OrganizationId() oid: number, @Param() { id }: IdParam) {
		return this.apiDistributorService.getOne(oid, id)
	}

	@Post('create')
	async createOne(@OrganizationId() oid: number, @Body() body: DistributorCreateBody) {
		return await this.apiDistributorService.createOne(oid, body)
	}

	@Patch('update/:id')
	@ApiParam({ name: 'id', example: 1 })
	async updateOne(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: DistributorUpdateBody) {
		return await this.apiDistributorService.updateOne(oid, id, body)
	}
}
