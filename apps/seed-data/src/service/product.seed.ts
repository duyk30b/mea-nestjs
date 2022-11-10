import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { randomDate, randomNumber } from '_libs/common/helpers/random.helper'
import { Product, ProductBatch } from '_libs/database/entities'
import { DataSource } from 'typeorm'
import { productExampleData } from '../long-nguyen/product.example'

@Injectable()
export class ProductSeed {
	constructor(private readonly dataSource: DataSource) { }

	async startCreateProduct(oid: number) {
		const countProduct = await this.dataSource.getRepository(Product).count()
		if (countProduct) return

		const productsDto: Product[] = []
		for (let i = 0; i < productExampleData.length; i++) {
			const product = new Product()
			const medicine = productExampleData[i]

			product.oid = oid

			product.brandName = medicine.brandName
			product.substance = medicine.substance
			product.group = medicine.group
			product.unit = JSON.stringify([{ name: medicine.unit, rate: 1 }])
			product.route = medicine.route
			product.source = medicine.source
			product.hintUsage = faker.lorem.sentence()

			productsDto.push(product)
		}

		await this.dataSource.getRepository(Product).insert(productsDto)
	}

	async startCreateProductBatch(oid: number) {
		const products = await this.dataSource.getRepository(Product).findBy({ oid })
		const productBatchesDto: ProductBatch[] = []
		for (let i = 0; i < products.length; i++) {
			const product = products[i]
			const number = randomNumber(2, 5)
			const costPrice = randomNumber(10000, 1000_000, 1000)

			for (let j = 0; j < number; j++) {
				const expiryDate = randomDate(new Date('2025-06-03'), new Date('2028-07-09'))
				const productBatch = new ProductBatch()
				const rate = randomNumber(0.8, 1.2, 0.01)

				productBatch.oid = oid
				productBatch.productId = product.id
				productBatch.batch = faker.lorem.word(5)
				productBatch.expiryDate = expiryDate.getTime()
				productBatch.costPrice = Math.floor(costPrice * rate / 5000) * 5000
				productBatch.retailPrice = Math.floor(costPrice * rate * 1.8 / 5000) * 5000
				productBatch.wholesalePrice = Math.floor(costPrice * rate * 1.2 / 5000) * 5000

				productBatchesDto.push(productBatch)
			}
		}

		await this.dataSource.getRepository(ProductBatch).insert(productBatchesDto)
	}
}
