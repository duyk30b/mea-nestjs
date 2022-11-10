import { Injectable } from '@nestjs/common'
import { DistributorRepository } from '_libs/database/repository'
import { BusinessException } from '../../exception-filters/business-exception.filter'
import { ErrorMessage } from '../../exception-filters/exception.const'
import { DistributorCreateBody, DistributorGetManyQuery, DistributorPaginationQuery, DistributorUpdateBody } from './request'

@Injectable()
export class ApiDistributorService {
	constructor(private readonly distributorRepository: DistributorRepository) { }

	async pagination(oid: number, query: DistributorPaginationQuery) {
		return await this.distributorRepository.pagination({
			page: query.page,
			limit: query.limit,
			criteria: {
				oid,
				isActive: query.filter?.isActive,
				fullNameEn: ['LIKE', query.filter?.fullNameEn],
				phone: ['LIKE', query.filter?.phone],
			},
			order: query.sort || { id: 'DESC' },
		})
	}

	async getMany(oid: number, { limit, filter }: DistributorGetManyQuery) {
		return await this.distributorRepository.find({
			criteria: {
				oid,
				fullNameEn: ['LIKE', filter?.fullNameEn],
				phone: ['LIKE', filter?.phone],
			},
			limit,
		})
	}

	async getOne(oid: number, id: number) {
		const distributor = await this.distributorRepository.findOne({ oid, id })
		if (!distributor) throw new BusinessException(ErrorMessage.Distributor.NotFound)
		return distributor
	}

	async createOne(oid: number, body: DistributorCreateBody) {
		return await this.distributorRepository.insertOne({ oid, ...body })
	}

	async updateOne(oid: number, id: number, body: DistributorUpdateBody) {
		const { affected } = await this.distributorRepository.updateOne({ id, oid }, body)
		if (affected !== 1) throw new Error(ErrorMessage.Database.UpdateFailed)
		return await this.distributorRepository.findOne({ id })
	}
}
