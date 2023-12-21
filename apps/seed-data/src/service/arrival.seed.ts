// import { Injectable } from '@nestjs/common'
// import { InjectRepository } from '@nestjs/typeorm'
// import { randomItemsInArray } from 'library/common/helpers/random.helper'
// import { Arrival, Customer } from 'library/database/entities'
// import { Repository } from 'typeorm'

// @Injectable()
// export class ArrivalSeed {
//     constructor(
//         @InjectRepository(Arrival) private readonly arrivalRepository: Repository<Arrival>,
//         @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>
//     ) {}

//     // async start(oid: number, number: number) {
//     //     const customerIdsQuery = await this.customerRepository.find({
//     //         where: { oid },
//     //         select: { id: true },
//     //     })
//     //     const customerIds = customerIdsQuery.map((i) => i.id)

//     //     const arrivalsDto: Arrival[] = []
//     //     for (let i = 0; i < number; i++) {
//     //         const arrival = new Arrival()

//     //         arrival.oid = oid
//     //         arrival.customerId = randomItemsInArray(customerIds)
//     //         arrival.createTime = Date.now() + (i - 24) * 60 * 60 * 1000 // bắt đầu từ 1 ngày trước
//     //         arrival.endTime = arrival.createTime + 2 * 60 * 60 * 1000

//     //         arrivalsDto.push(arrival)
//     //     }

//     //     // await this.arrivalRepository.save(arrivalsDto, { transaction: false })
//     //     await this.arrivalRepository.insert(arrivalsDto)
//     // }
// }
