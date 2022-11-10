// import { Body, Controller, Param, Patch, Post } from '@nestjs/common'
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
// import { IdParam } from '../../common/swagger'
// import { OrganizationId } from '../../decorators/request.decorator'
// import { ApiDiagnosisService } from './api-arrival-diagnosis.service'
// import { CreateDiagnosisBody, UpdateDiagnosisBody } from './request'

// @ApiTags('Arrival Diagnosis')
// @ApiBearerAuth('access-token')
// @Controller('arrival-diagnosis')
// export class ApiDiagnosisController {
// 	constructor(private readonly apiDiagnosisService: ApiDiagnosisService) { }

// 	@Post('create')
// 	async createOne(@OrganizationId() oid: number, @Body() body: CreateDiagnosisBody) {
// 		return await this.apiDiagnosisService.createOne(oid, body)
// 	}

// 	@Patch('update/:id')
// 	async updateOne(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: UpdateDiagnosisBody) {
// 		return await this.apiDiagnosisService.updateOne(oid, id, body)
// 	}
// }
