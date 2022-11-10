import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomEnum, randomFullName, randomPhoneNumber } from '_libs/common/helpers/random.helper'
import { convertViToEn } from '_libs/common/helpers/string.helper'
import { EGender } from '_libs/database/common/variable'
import { Distributor } from '_libs/database/entities'
import { Repository } from 'typeorm'
import { AddressData } from '../address/address.service'

@Injectable()
export class DistributorSeed {
	constructor(@InjectRepository(Distributor) private readonly distributorRepository: Repository<Distributor>) { }

	async start(oid: number, number: number) {
		const distributorsDto: Distributor[] = []
		for (let i = 0; i < number; i++) {
			const gender = randomEnum<EGender>(EGender)
			const fullNameVi = randomFullName(gender)
			const fullNameEn = convertViToEn(fullNameVi)
			const address = AddressData.getRandomAddress()

			const distributor = new Distributor()

			distributor.oid = oid
			distributor.fullNameVi = fullNameVi
			distributor.fullNameEn = fullNameEn
			distributor.phone = randomPhoneNumber()
			distributor.addressProvince = address.province
			distributor.addressDistrict = address.district
			distributor.addressWard = address.ward
			distributor.addressStreet = address.street
			distributor.debt = 0

			distributorsDto.push(distributor)
		}
		// await this.distributorRepository.save(distributorsDto, { transaction: false })
		await this.distributorRepository.insert(distributorsDto)
	}
}
