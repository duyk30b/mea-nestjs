import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import {
  HeaderResolver,
  I18nJsonLoader,
  I18nMiddleware,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n'
import * as path from 'path'
import { JwtExtendModule } from '../../_libs/common/jwt-extend/jwt-extend.module'
import { DetectClientMiddleware } from '../../_libs/common/middleware/detect-client.middleware'
import { RepositoryModule } from '../../_libs/database/repository/repository.module'
import { SqlModule } from '../../_libs/database/sql.module'
import { CacheManagerModule } from '../../_libs/transporter/cache-manager/cache-manager.module'
import { GoogleDriverModule } from '../../_libs/transporter/google-driver/google-driver.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

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
    CacheManagerModule,
    GoogleDriverModule,
  ],
  controllers: [AppController],
  providers: [AppService],
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
