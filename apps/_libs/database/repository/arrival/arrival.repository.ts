// import { Injectable } from '@nestjs/common'
// import { InjectEntityManager } from '@nestjs/typeorm'
// import { InvoiceItemType } from '../../common/variable'
// import { Between, DataSource, EntityManager, FindOptionsWhere, In, LessThan, MoreThanOrEqual } from 'typeorm'
// import { Arrival } from '../../entities'
// import { ArrivalCondition, ArrivalOrder } from './arrival.dto'

// @Injectable()
// export class ArrivalRepository {
//     constructor(
//         private dataSource: DataSource,
//         @InjectEntityManager() private manager: EntityManager
//     ) { }

//     getWhereOptions(condition: ArrivalCondition = {}) {
//         const where: FindOptionsWhere<Arrival> = {}
//         if (condition.oid != null) where.oid = condition.oid
//         if (condition.id != null) where.id = condition.id
//         if (condition.customerId != null) where.customerId = condition.customerId
//         if (condition.type != null) where.type = condition.type
//         if (condition.status != null) where.status = condition.status

//         if (condition.ids) {
//             if (condition.ids.length === 0) condition.ids.push(0)
//             where.id = In(condition.ids)
//         }
//         if (condition.types) where.type = In(condition.types)

//         let startTime = undefined
//         if (condition.fromTime && condition.toTime) startTime = Between(condition.fromTime, condition.toTime)
//         else if (condition.fromTime) startTime = MoreThanOrEqual(condition.fromTime)
//         else if (condition.toTime) startTime = LessThan(condition.toTime)
//         if (startTime != null) where.startTime = startTime

//         return where
//     }

//     async pagination(options: { page: number, limit: number, condition?: ArrivalCondition, order?: ArrivalOrder }) {
//         const { limit, page, condition, order } = options

//         const [data, total] = await this.manager.findAndCount(Arrival, {
//             where: this.getWhereOptions(condition),
//             order,
//             take: limit,
//             skip: (page - 1) * limit,
//         })

//         return { total, page, limit, data }
//     }

//     async findOne(condition: { id: number, oid: number }, relation?: {
//         customer?: boolean,
//         invoices?: { invoiceItems?: { procedure?: boolean, productBatch?: boolean } }
//     }): Promise<Arrival> {
//         let query = this.manager.createQueryBuilder(Arrival, 'arrival')
//         if (relation?.customer) query = query.leftJoinAndSelect('arrival.customer', 'customer')
//         if (relation?.invoices) query = query.leftJoinAndSelect('arrival.invoices', 'invoice')
//         if (relation?.invoices?.invoiceItems) query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem')
//         if (relation?.invoices?.invoiceItems?.procedure) query = query.leftJoinAndSelect(
//             'invoiceItem.procedure',
//             'procedure',
//             'invoiceItem.type = :typeProcedure',
//             { typeProcedure: InvoiceItemType.Procedure }
//         )
//         if (relation?.invoices?.invoiceItems?.productBatch) {
//             query = query
//                 .leftJoinAndSelect(
//                     'invoiceItem.productBatch',
//                     'productBatch',
//                     'invoiceItem.type = :typeProductBatch',
//                     { typeProductBatch: InvoiceItemType.ProductBatch }
//                 )
//                 .leftJoinAndSelect('productBatch.product', 'product')
//         }

//         query = query.where('arrival.id = :id', { id: condition.id })
//             .andWhere('arrival.oid = :oid', { oid: condition.oid })

//         const arrival = await query.getOne()
//         return arrival
//     }
// }
