import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ERole } from '_libs/database/common/variable'
import { OrganizationId } from '../../decorators/request.decorator'
import { Roles } from '../../guards/roles.guard'
import { ApiEmployeeService } from './api-employee.service'
import { EmployeePaginationQuery, EmployeeUpdateBody } from './request'
import { IdParam } from '../../common/swagger'

@ApiTags('Employee')
@ApiBearerAuth('access-token')
@Roles(ERole.Admin)
@Controller('employee')
export class ApiEmployeeController {
	constructor(private readonly apiEmployeeService: ApiEmployeeService) { }

	@Get('pagination')
	async pagination(@OrganizationId() oid: number, @Query() query: EmployeePaginationQuery) {
		return await this.apiEmployeeService.pagination(oid, query)
	}

	@Get('detail/:id')
	async detail(@OrganizationId() oid: number, @Param() { id }: IdParam) {
		return await this.apiEmployeeService.getOne(oid, id)
	}

	// @Post('create')
	// create(@OrganizationId() oid: number, @Body() createEmployeeDto: CreateEmployeeDto) {
	// 	return this.apiEmployeeService.create(oid, createEmployeeDto)
	// }

	@Patch('update/:id')
	async update(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: EmployeeUpdateBody) {
		return await this.apiEmployeeService.updateOne(oid, id, body)
	}
}
