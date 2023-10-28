import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ERole } from '_libs/database/common/variable'
import { External, TExternal } from '../../common/request-external'
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
	async pagination(@External() { oid }: TExternal, @Query() query: EmployeePaginationQuery) {
		return await this.apiEmployeeService.pagination(oid, query)
	}

	@Get('detail/:id')
	async detail(@External() { oid }: TExternal, @Param() { id }: IdParam) {
		return await this.apiEmployeeService.getOne(oid, id)
	}

	// @Post('create')
	// create(@External() { oid }: TExternal, @Body() createEmployeeDto: CreateEmployeeDto) {
	// 	return this.apiEmployeeService.create(oid, createEmployeeDto)
	// }

	@Patch('update/:id')
	async update(@External() { oid }: TExternal, @Param() { id }: IdParam, @Body() body: EmployeeUpdateBody) {
		return await this.apiEmployeeService.updateOne(oid, id, body)
	}
}
