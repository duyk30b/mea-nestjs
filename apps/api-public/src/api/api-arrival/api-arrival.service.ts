import { Injectable } from '@nestjs/common'

@Injectable()
export class ApiArrivalService {
  // constructor(
  //     private readonly arrivalRepository: ArrivalRepository,
  //     private readonly customerRepository: CustomerRepository
  // ) { }
  // async pagination(oid: number, query: ArrivalPaginationQuery) {
  //     const { page, limit, total, data } = await this.arrivalRepository.pagination({
  //         page: query.page,
  //         limit: query.limit,
  //         condition: {
  //             oid,
  //             customerId: query.filter?.customerId,
  //             fromTime: query.filter?.fromTime,
  //             toTime: query.filter?.toTime,
  //             types: query.filter?.types,
  //         },
  //         order: query.sort || { id: 'DESC' },
  //     })
  //     if (query.relation?.customer && data.length) {
  //         const customerIds = uniqueArray(data.map((i) => i.customerId))
  //         const customers = await this.customerRepository.findMany({ ids: customerIds })
  //         data.forEach((i) => i.customer = customers.find((j) => j.id === i.customerId))
  //     }
  //     return { page, limit, total, data }
  // }
  // async getOne(oid: number, id: number, { relation }: ArrivalGetOneQuery) {
  //     const arrival = await this.arrivalRepository.findOne({ id, oid }, {
  //         customer: !!relation?.customer,
  //         invoices: relation?.invoices && { invoiceItems: { procedure: true, productBatch: true } },
  //     })
  //     return arrival
  // }
}
