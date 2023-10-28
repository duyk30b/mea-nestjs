import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import Organization from '../../../../_libs/database/entities/organization.entity'
import User from '../../../../_libs/database/entities/user.entity'
import { EmailModule } from '../../components/email/email.module'
import { GlobalConfig, JwtConfig } from '../../environments'
import { JwtExtendModule } from '../jwt-extend/jwt-extend.module'
import { ApiAuthController } from './api-auth.controller'
import { ApiAuthService } from './api-auth.service'

@Module({
  imports: [
    ConfigModule.forFeature(GlobalConfig),
    ConfigModule.forFeature(JwtConfig),
    TypeOrmModule.forFeature([Organization, User]),
    JwtExtendModule,
    EmailModule,
  ],
  controllers: [ApiAuthController],
  providers: [ApiAuthService],
})
export class ApiAuthModule {}
