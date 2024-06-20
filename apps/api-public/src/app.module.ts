import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import {
  HeaderResolver,
  I18nJsonLoader,
  I18nMiddleware,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n'
import * as path from 'path'
import { RepositoryModule } from '../../_libs/database/repository/repository.module'
import { SqlModule } from '../../_libs/database/sql.module'
import { CacheManagerModule } from '../../_libs/transporter/cache-manager/cache-manager.module'
import { ApiModule } from './api/api.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { JwtExtendModule } from './auth/jwt-extend/jwt-extend.module'
import { EmailModule } from './components/email/email.module'
import { HealthModule } from './components/health/health.module'
import { EventListenerModule } from './event-listener/event-listener.module'
import { PermissionGuard } from './guards/permission.guard'
import { DetectClientMiddleware } from './middleware/detect-client.middleware copy'
import { RootModule } from './root/root.module'
import { SocketModule } from './socket/socket.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 5000, limit: 5 }]),
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '../../../assets/i18n/'),
        watch: true,
      },
      resolvers: [new QueryResolver(['lang', 'l']), new HeaderResolver(['x-lang'])],
      typesOutputPath: path.join(__dirname, '../../../assets/generated/i18n.generated.ts'),
    }),
    SqlModule,
    RepositoryModule,

    JwtExtendModule,
    HealthModule,
    EmailModule,
    // CronJobModule,

    EventListenerModule,
    SocketModule,
    CacheManagerModule,

    AuthModule,
    ApiModule,
    RootModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(I18nMiddleware).forRoutes('*')
    consumer.apply(DetectClientMiddleware).forRoutes('*')
    // consumer
    //   .apply(ValidateTokenMiddleware)
    //   .exclude('auth/(.*)', '/documents/(.*)', { path: 'health', method: RequestMethod.GET })
    //   .forRoutes('*')
  }
}
