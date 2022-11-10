import { Module } from '@nestjs/common'
import { ApiOrganizationController } from './api-organization.controller'
import { ApiOrganizationService } from './api-organization.service'

@Module({
	imports: [],
	controllers: [ApiOrganizationController],
	providers: [ApiOrganizationService],
})
export class ApiOrganizationModule { }
