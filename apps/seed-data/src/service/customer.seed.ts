import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { randomDate, randomEnum, randomFullName, randomPhoneNumber } from '_libs/common/helpers/random.helper'
import { EGender } from '_libs/database/common/variable'
import { Customer } from '_libs/database/entities'
import { DataSource } from 'typeorm'
import { AddressData } from '../address/address.service'
import { convertViToEn } from '_libs/common/helpers/string.helper'

@Injectable()
export class CustomerSeed {
	constructor(private readonly dataSource: DataSource) { }

	async start(oid: number, number: number) {
		const customersDto: Customer[] = []
		for (let i = 0; i < number; i++) {
			const gender = randomEnum<EGender>(EGender)
			const fullNameVi = randomFullName(gender)
			const fullNameEn = convertViToEn(fullNameVi)
			const address = AddressData.getRandomAddress()

			const customer = new Customer()

			customer.oid = oid
			customer.fullNameVi = fullNameVi
			customer.fullNameEn = fullNameEn
			customer.phone = randomPhoneNumber()
			customer.birthday = randomDate('1965-03-28', '2020-12-29').getTime()
			customer.gender = gender
			customer.addressProvince = address.province
			customer.addressDistrict = address.district
			customer.addressWard = address.ward
			customer.addressStreet = address.street
			customer.healthHistory = faker.lorem.sentence()
			customer.debt = 0

			customersDto.push(customer)
		}

		// await this.dataSource.getRepository(Customer).save(customersDto, { transaction: false })
		await this.dataSource.getRepository(Customer).insert(customersDto)
	}
}
