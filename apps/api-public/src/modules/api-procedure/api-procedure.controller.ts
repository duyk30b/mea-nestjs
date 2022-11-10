import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiProcedureService } from './api-procedure.service'
import { ProcedureCreateBody, ProcedureGetManyQuery, ProcedurePaginationQuery, ProcedureUpdateBody } from './request'

@ApiTags('Procedure')
@ApiBearerAuth('access-token')
@Controller('procedure')
export class ApiProcedureController {
	constructor(private readonly apiProcedureService: ApiProcedureService) { }

	@Get('pagination')
	pagination(@OrganizationId() oid: number, @Query() query: ProcedurePaginationQuery) {
		return this.apiProcedureService.pagination(oid, query)
	}

	@Get('list')
	async list(@OrganizationId() oid: number, @Query() query: ProcedureGetManyQuery) {
		return await this.apiProcedureService.getMany(oid, query)
	}

	@Get('detail/:id')
	async detail(@OrganizationId() oid: number, @Param() { id }: IdParam) {
		return await this.apiProcedureService.getOne(oid, id)
	}

	@Post('create')
	async create(@OrganizationId() oid: number, @Body() body: ProcedureCreateBody) {
		return await this.apiProcedureService.createOne(oid, body)
	}

	@Patch('update/:id')
	@ApiParam({ name: 'id', example: 1 })
	async update(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: ProcedureUpdateBody) {
		return await this.apiProcedureService.updateOne(oid, id, body)
	}
}
