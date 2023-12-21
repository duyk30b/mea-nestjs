// import { Module } from '@nestjs/common'
// import { ConfigModule } from '@nestjs/config'
// import { TypeOrmModule } from '@nestjs/typeorm'
// import {
//     Customer,
//     Distributor,
//     DistributorPayment,
//     Employee,
//     Invoice,
//     InvoiceItem,
//     Organization,
//     OrganizationSetting,
//     Procedure,
//     Product,
//     ProductBatch,
//     ProductMovement,
//     Receipt,
//     ReceiptItem,
// } from 'library/database/entities'
// import { SqlModule } from 'library/database/sql.module'
// import { LongNguyenApi } from './long-nguyen/long-nguyen.api'
// import { SeedDataApi } from './seed-data.api'
// import { SeedDataCommand } from './seed-data.command'
// import { CustomerSeed } from './service/customer.seed'
// import { DistributorSeed } from './service/distributor.seed'
// import { EmployeeSeed } from './service/employee.seed'
// import { InvoiceSeed } from './service/invoice.seed'
// import { OrganizationSeed } from './service/organization.seed'
// import { ProcedureSeed } from './service/procedure.seed'
// import { ProductSeed } from './service/product.seed'
// import { ReceiptSeed } from './service/receipt.seed'
// import { TestApi } from './test-sql.api'

// @Module({
//     imports: [
//         ConfigModule.forRoot({
//             envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
//             isGlobal: true,
//         }),
//         SqlModule,
//         TypeOrmModule.forFeature([
//             Customer,
//             Distributor,
//             DistributorPayment,
//             Employee,
//             Invoice,
//             InvoiceItem,
//             Organization,
//             OrganizationSetting,
//             Product,
//             ProductBatch,
//             ProductMovement,
//             Procedure,
//             Receipt,
//             ReceiptItem,
//         ]),
//     ],
//     controllers: [LongNguyenApi, SeedDataApi, TestApi],
//     providers: [
//         InvoiceSeed,
//         CustomerSeed,
//         DistributorSeed,
//         EmployeeSeed,
//         OrganizationSeed,
//         ProcedureSeed,
//         ReceiptSeed,
//         ProductSeed,
//         SeedDataCommand,
//     ],
// })
// export class SeedDataModule {}
