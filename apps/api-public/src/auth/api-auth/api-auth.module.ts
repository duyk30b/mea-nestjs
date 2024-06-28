import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtExtendModule } from '../../../../_libs/common/jwt-extend/jwt-extend.module'
import { JwtConfig } from '../../../../_libs/common/jwt-extend/jwt.config'
import Organization from '../../../../_libs/database/entities/organization.entity'
import User from '../../../../_libs/database/entities/user.entity'
import { GlobalConfig } from '../../../../_libs/environments'
import { EmailModule } from '../../components/email/email.module'
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
