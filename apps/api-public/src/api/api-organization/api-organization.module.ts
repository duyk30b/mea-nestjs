import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtConfig } from '../../../../_libs/common/jwt-extend/jwt.config'
import { GlobalConfig } from '../../../../_libs/environments'
import { EmailModule } from '../../components/email/email.module'
import { ApiOrganizationController } from './api-organization.controller'
import { ApiOrganizationService } from './api-organization.service'

@Module({
  imports: [
    ConfigModule.forFeature(JwtConfig),
    ConfigModule.forFeature(GlobalConfig),
    EmailModule,
  ],
  controllers: [ApiOrganizationController],
  providers: [ApiOrganizationService],
})
export class ApiOrganizationModule { }
