import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { HeaderResolver, I18nJsonLoader, I18nMiddleware, I18nModule, QueryResolver } from 'nestjs-i18n'
import * as path from 'path'
import { RepositoryModule } from '../../_libs/database/repository/repository.module'
import { SqlModule } from '../../_libs/database/sql.module'
import { ApiCustomerPaymentModule } from './api/api-customer-payment/api-customer-payment.module'
import { ApiCustomerModule } from './api/api-customer/api-customer.module'
import { ApiDistributorPaymentModule } from './api/api-distributor-payment/api-distributor-payment.module'
import { ApiDistributorModule } from './api/api-distributor/api-distributor.module'
import { ApiInvoiceItemModule } from './api/api-invoice-item/api-invoice-item.module'
import { ApiInvoiceModule } from './api/api-invoice/api-invoice.module'
import { ApiOrganizationModule } from './api/api-organization/api-organization.module'
import { ApiProcedureModule } from './api/api-procedure/api-procedure.module'
import { ApiProductBatchModule } from './api/api-product-batch/api-product-batch.module'
import { ApiProductMovementModule } from './api/api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api/api-product/api-product.module'
import { ApiReceiptModule } from './api/api-receipt/api-receipt.module'
import { ApiStatisticModule } from './api/api-statistics/api-statistic.module'
import { ApiUserModule } from './api/api-user/api-user.module'
import { AuthModule } from './api/auth/auth.module'
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
        AuthModule,
        ApiCustomerModule,
        ApiCustomerPaymentModule,
        ApiDistributorModule,
        ApiDistributorPaymentModule,
        ApiUserModule,
        ApiInvoiceModule,
        ApiInvoiceItemModule,
        ApiOrganizationModule,
        ApiProductModule,
        ApiProductBatchModule,
        ApiProductMovementModule,
        ApiProcedureModule,
        ApiReceiptModule,
        ApiStatisticModule,
        ApiUserModule,
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
