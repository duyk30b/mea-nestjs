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
import { CacheDataModule } from '../../_libs/common/cache-data/cache-data.module'
import { PermissionGuard } from '../../_libs/common/guards/permission.guard'
import { JwtExtendModule } from '../../_libs/common/jwt-extend/jwt-extend.module'
import { DetectClientMiddleware } from '../../_libs/common/middleware/detect-client.middleware'
import { PostgresqlModule } from '../../_libs/database/postgresql.module'
import { GoogleDriverModule } from '../../_libs/transporter/google-driver/google-driver.module'
import { AuthModule } from './api-auth/auth.module'
import { ApiRootModule } from './api-root/api-root.module'
import { ApiModule } from './api/api.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EmailModule } from './components/email/email.module'
import { HealthModule } from './components/health/health.module'
import { ImageManagerModule } from './components/image-manager/image-manager.module'
import { EventListenerModule } from './event-listener/event-listener.module'
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
    PostgresqlModule,

    JwtExtendModule,
    GoogleDriverModule,
    HealthModule,
    EmailModule,
    ImageManagerModule,
    // CronJobModule,

    EventListenerModule,
    SocketModule,
    CacheDataModule,

    AuthModule,
    ApiModule,
    ApiRootModule,
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
    // consumer.apply(HelmetMiddleware).forRoutes('*')
    // consumer
    //   .apply(ValidateTokenMiddleware)
    //   .exclude('auth/(.*)', '/documents/(.*)', { path: 'health', method: RequestMethod.GET })
    //   .forRoutes('*')
  }
}
