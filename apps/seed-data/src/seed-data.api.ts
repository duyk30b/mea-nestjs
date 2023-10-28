// import { Controller, Get } from '@nestjs/common'
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
// import { InjectEntityManager } from '@nestjs/typeorm'
// import { DataSource, EntityManager } from 'typeorm'
// import { AddressData } from './address/address.service'
// import { CustomerSeed } from './service/customer.seed'
// import { DistributorSeed } from './service/distributor.seed'
// import { UserSeed } from './service/employee.seed'
// import { InvoiceSeed } from './service/invoice.seed'
// import { OrganizationSeed } from './service/organization.seed'
// import { ProcedureSeed } from './service/procedure.seed'
// import { ProductSeed } from './service/product.seed'
// import { ReceiptSeed } from './service/receipt.seed'

// @ApiTags('Seed Data')
// @ApiBearerAuth('access-token')
// @Controller('seed')
// export class SeedDataApi {
//     constructor(
//         private dataSource: DataSource,
//         @InjectEntityManager() private manager: EntityManager,
//         private readonly organizationSeed: OrganizationSeed,
//         private readonly employeeSeed: UserSeed,
//         private readonly distributorSeed: DistributorSeed,
//         private readonly customerSeed: CustomerSeed,
//         private readonly productSeed: ProductSeed,
//         private readonly invoiceSeed: InvoiceSeed,
//         private readonly receiptSeed: ReceiptSeed,
//         private readonly procedureSeed: ProcedureSeed
//     ) {
//         this.init()
//     }

//     async init() {
//         await AddressData.init()
//     }

//     // @Get('truncate')
//     // async truncate() {
//     //     await this.manager.clear(Organization)
//     //     await this.manager.clear(OrganizationSetting)
//     //     await this.manager.clear(Customer)
//     //     await this.manager.clear(CustomerDebt)
//     //     await this.manager.clear(Distributor)
//     //     await this.manager.clear(DistributorPayment)
//     //     await this.manager.clear(Product)
//     //     await this.manager.clear(ProductBatch)
//     //     await this.manager.clear(ProductMovement)
//     //     await this.manager.clear(Arrival)
//     //     await this.manager.clear(Invoice)
//     //     await this.manager.clear(InvoiceItem)
//     //     await this.manager.clear(Receipt)
//     //     await this.manager.clear(ReceiptItem)
//     //     return { success: true }
//     // }

//     @Get('start')
//     async startSeedData() {
//         const startDate = Date.now()
//         console.log('======== [START]: Seed data ========')
//         const oid = 1

//         await this.organizationSeed.start(oid)
//         await this.employeeSeed.start(oid, 50)
//         await this.distributorSeed.start(oid, 100)
//         await this.customerSeed.start(oid, 100)
//         await this.productSeed.startCreateProduct(oid)
//         await this.procedureSeed.start(oid)

//         await this.productSeed.startCreateProductBatch(oid)
//         // await this.receiptSeed.start(oid, 200)
//         // await this.invoiceSeed.start(oid, 200, new Date('2023-06-20'), new Date('2023-08-06'))

//         // await this.diagnosisSeed.createForAllArrival(oid)

//         const endDate = Date.now()
//         const time = endDate - startDate
//         console.log(`======== [SUCCESS] - ${time}ms ========`)
//         return { time }
//     }

//     // @Get('drop_db')
//     // async drop() {
//     //     await this.manager.query('DROP DATABASE mea_sql;')
//     //     await this.manager.query('CREATE DATABASE mea_sql;')
//     //     return { success: true }
//     // }
// }
