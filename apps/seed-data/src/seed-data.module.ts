// import { Module } from '@nestjs/common'
// import { ConfigModule } from '@nestjs/config'
// import { TypeOrmModule } from '@nestjs/typeorm'
// import {
//   Batch,
//   Customer,
//   CustomerPayment,
//   Distributor,
//   DistributorPayment,
//   Invoice,
//   InvoiceExpense,
//   InvoiceItem,
//   InvoiceSurcharge,
//   Organization,
//   OrganizationSetting,
//   Procedure,
//   Product,
//   ProductMovement,
//   Receipt,
//   ReceiptItem,
//   Role,
//   User,
// } from '../../_libs/database/entities'
// import { PostgresqlModule } from '../../_libs/database/sql.module'
// import { TestApi } from './test-sql.api'

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
//       isGlobal: true,
//     }),
//     PostgresqlModule,
//     TypeOrmModule.forFeature([
//       Customer,
//       Distributor,
//       CustomerPayment,
//       DistributorPayment,
//       Invoice,
//       InvoiceItem,
//       InvoiceExpense,
//       InvoiceSurcharge,
//       Organization,
//       OrganizationSetting,
//       Product,
//       Batch,
//       ProductMovement,
//       Procedure,
//       Receipt,
//       ReceiptItem,
//       User,
//       Role,
//     ]),
//   ],
//   controllers: [TestApi],
//   providers: [],
// })
// export class SeedDataModule {}
