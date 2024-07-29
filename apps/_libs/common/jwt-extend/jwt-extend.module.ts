import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { JwtExtendService } from './jwt-extend.service'
import { JwtConfig } from './jwt.config'

@Module({
  imports: [ConfigModule.forFeature(JwtConfig), JwtModule],
  providers: [JwtExtendService],
  exports: [JwtExtendService],
})
export class JwtExtendModule {}
