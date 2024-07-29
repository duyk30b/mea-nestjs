import { Module } from '@nestjs/common'
import { ApiRootDataModule } from './api-root-data/api-root-data.module'
import { ApiRootOrganizationModule } from './api-root-organization/api-root-organization.module'
import { ApiRootUserModule } from './api-root-user/api-root-user.module'

@Module({
  imports: [ApiRootOrganizationModule, ApiRootUserModule, ApiRootDataModule],
  controllers: [],
  providers: [],
})
export class ApiRootModule { }
