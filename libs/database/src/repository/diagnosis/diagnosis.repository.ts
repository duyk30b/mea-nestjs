import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Diagnosis from '_libs/database/entities/diagnosis.entity'
import { FindOptionsWhere, In, Repository } from 'typeorm'
import { CriteriaDiagnosis } from './diagnosis.dto'

@Injectable()
export class DiagnosisRepository {
	constructor(@InjectRepository(Diagnosis) private readonly diagnosisRepository: Repository<Diagnosis>) { }

	getWhereOptions(criteria: CriteriaDiagnosis = {}) {
		const where: FindOptionsWhere<Diagnosis> = {}
		if (criteria.id != null) where.id = criteria.id
		if (criteria.arrivalId != null) where.arrivalId = criteria.arrivalId

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}

		return where
	}

	async findOne(criteria: CriteriaDiagnosis): Promise<Diagnosis> {
		const where = this.getWhereOptions(criteria)
		return await this.diagnosisRepository.findOne({ where })
	}

	async findMany(criteria: CriteriaDiagnosis): Promise<Diagnosis[]> {
		const where = this.getWhereOptions(criteria)
		return await this.diagnosisRepository.find({ where })
	}

	async insertOne(dto: Partial<Diagnosis>): Promise<Diagnosis> {
		const product = this.diagnosisRepository.create(dto)
		return this.diagnosisRepository.save(product)
	}

	async update(criteria: CriteriaDiagnosis, dto: Partial<Omit<Diagnosis, 'id' | 'oid' | 'arrivalId'>>) {
		const where = this.getWhereOptions(criteria)
		return await this.diagnosisRepository.update(where, dto)
	}
}
