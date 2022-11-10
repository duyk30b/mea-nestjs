import { Module } from '@nestjs/common'
import { ApiEmployeeController } from './api-employee.controller'
import { ApiEmployeeService } from './api-employee.service'

@Module({
	imports: [],
	controllers: [ApiEmployeeController],
	providers: [ApiEmployeeService],
	exports: [],
})
export class ApiEmployeeModule { }
