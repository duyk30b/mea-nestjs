import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RepositoryModule } from '_libs/database/repository'
import { SqlModule } from '_libs/database/sql.module'
import { HeaderResolver, I18nJsonLoader, I18nMiddleware, I18nModule, QueryResolver } from 'nestjs-i18n'
import * as path from 'path'
import { EmailModule } from './components/email/email.module'
import { HealthModule } from './components/health/health.module'
import { JwtExtendModule } from './components/jwt-extend/jwt-extend.module'
import { DetectClientMiddleware } from './middleware/detect-client.middleware copy'
import { ValidateTokenMiddleware } from './middleware/validate-token.middleware'
import { ApiArrivalModule } from './modules/api-arrival/api-arrival.module'
import { ApiCustomerDebtModule } from './modules/api-customer-debt/api-customer-debt.module'
import { ApiCustomerModule } from './modules/api-customer/api-customer.module'
import { ApiDistributorDebtModule } from './modules/api-distributor-debt/api-distributor-debt.module'
import { ApiDistributorModule } from './modules/api-distributor/api-distributor.module'
import { ApiEmployeeModule } from './modules/api-employee/api-employee.module'
import { ApiInvoiceItemModule } from './modules/api-invoice-item/api-invoice-item.module'
import { ApiInvoiceModule } from './modules/api-invoice/api-invoice.module'
import { ApiOrganizationModule } from './modules/api-organization/api-organization.module'
import { ApiProcedureModule } from './modules/api-procedure/api-procedure.module'
import { ApiProductBatchModule } from './modules/api-product-batch/api-product-batch.module'
import { ApiProductMovementModule } from './modules/api-product-movement/api-product-movement.module'
import { ApiProductModule } from './modules/api-product/api-product.module'
import { ApiReceiptModule } from './modules/api-receipt/api-receipt.module'
import { ApiStatisticsModule } from './modules/api-statistics/api-statistics.module'
import { ApiUserModule } from './modules/api-user/api-user.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
			isGlobal: true,
		}),
		I18nModule.forRoot({
			fallbackLanguage: 'vi',
			loader: I18nJsonLoader,
			loaderOptions: {
				path: path.join(__dirname, '../../../assets/i18n/'),
				watch: true,
			},
			resolvers: [
				new QueryResolver(['lang', 'l']),
				new HeaderResolver(['x-lang']),
			],
			typesOutputPath: path.join(__dirname, '../../../assets/generated/i18n.generated.ts'),
		}),
		SqlModule,
		RepositoryModule,
		HealthModule,
		// SocketModule,
		EmailModule,
		JwtExtendModule,
		AuthModule,
		ApiArrivalModule,
		ApiCustomerModule,
		ApiCustomerDebtModule,
		ApiDistributorModule,
		ApiDistributorDebtModule,
		ApiEmployeeModule,
		ApiInvoiceModule,
		ApiInvoiceItemModule,
		ApiOrganizationModule,
		ApiProductModule,
		ApiProductBatchModule,
		ApiProductMovementModule,
		ApiProcedureModule,
		ApiReceiptModule,
		ApiStatisticsModule,
		ApiUserModule,
	],
	providers: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(I18nMiddleware).forRoutes('*')

		consumer.apply(DetectClientMiddleware).forRoutes('*')

		consumer.apply(ValidateTokenMiddleware)
			.exclude('auth/(.*)', '/', { path: 'health', method: RequestMethod.GET })
			.forRoutes('*')
	}
}
