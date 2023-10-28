// import { Injectable } from '@nestjs/common'
// import { InjectRepository } from '@nestjs/typeorm'
// import { randomEnum, randomFullName, randomPhoneNumber } from 'library/common/helpers/random.helper'
// import { EGender } from 'library/database/common/variable'
// import { Distributor } from 'library/database/entities'
// import { Repository } from 'typeorm'
// import { AddressData } from '../address/address.service'

// @Injectable()
// export class DistributorSeed {
//     constructor(
//         @InjectRepository(Distributor)
//         private readonly distributorRepository: Repository<Distributor>
//     ) {}

//     async start(oid: number, number: number) {
//         const distributorsDto: Distributor[] = []
//         for (let i = 0; i < number; i++) {
//             const gender = randomEnum<EGender>(EGender)
//             const fullName = randomFullName(gender)
//             const address = AddressData.getRandomAddress()

//             const distributor = new Distributor()

//             distributor.oid = oid
//             distributor.fullName = fullName
//             distributor.fullName = fullName
//             distributor.phone = randomPhoneNumber()
//             distributor.addressProvince = address.province
//             distributor.addressDistrict = address.district
//             distributor.addressWard = address.ward
//             distributor.addressStreet = address.street
//             distributor.debt = 0

//             distributorsDto.push(distributor)
//         }
//         // await this.distributorRepository.save(distributorsDto, { transaction: false })
//         await this.distributorRepository.insert(distributorsDto)
//     }
// }
