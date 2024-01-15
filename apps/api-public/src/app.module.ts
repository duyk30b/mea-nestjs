import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { HeaderResolver, I18nJsonLoader, I18nMiddleware, I18nModule, QueryResolver } from 'nestjs-i18n'
import * as path from 'path'
import { RepositoryModule } from '../../_libs/database/repository/repository.module'
import { SqlModule } from '../../_libs/database/sql.module'
import { ApiModule } from './api/api.module'
import { EmailModule } from './components/email/email.module'
import { HealthModule } from './components/health/health.module'
import { JwtExtendModule } from './components/jwt-extend/jwt-extend.module'
import { DetectClientMiddleware } from './middleware/detect-client.middleware copy'
import { ValidateTokenMiddleware } from './middleware/validate-token.middleware'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
            isGlobal: true,
        }),
        ThrottlerModule.forRoot({
            ttl: 5, // seconds
            limit: 5, // mỗi request giống hệt nhau chỉ được phép gọi 5 lần trong 5s
        }),
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
        ScheduleModule.forRoot(),
        HealthModule,
        // SocketModule,
        EmailModule,
        JwtExtendModule,

        ApiModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(I18nMiddleware).forRoutes('*')

        consumer.apply(DetectClientMiddleware).forRoutes('*')

        consumer
            .apply(ValidateTokenMiddleware)
            .exclude('auth/(.*)', { path: 'health', method: RequestMethod.GET })
            .forRoutes('*')
    }
}
