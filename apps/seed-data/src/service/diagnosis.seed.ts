import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomBloodPressure, randomNumber } from '_libs/common/helpers/random.helper'
import { Arrival, Diagnosis } from '_libs/database/entities'
import { DataSource, IsNull, Repository } from 'typeorm'

@Injectable()
export class DiagnosisSeed {
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(Arrival) private readonly arrivalRepository: Repository<Arrival>,
		@InjectRepository(Diagnosis) private readonly diagnosisRepository: Repository<Diagnosis>
	) { }

	async createForAllArrival(oid: number) {
		const arrivals = await this.arrivalRepository.findBy({
			oid,
			diagnosisId: IsNull(),
		})
		const arrivalIds = arrivals.map((i) => i.id)

		const diagnosisListDto: Diagnosis[] = []
		for (let i = 0; i < arrivalIds.length; i++) {
			const diagnosis = new Diagnosis()

			diagnosis.oid = oid
			diagnosis.arrivalId = arrivalIds[i]
			diagnosis.reason = faker.lorem.sentence()
			diagnosis.summary = faker.lorem.paragraphs()
			diagnosis.diagnosis = faker.lorem.sentence()

			diagnosis.pulse = randomNumber(60, 140)
			diagnosis.temperature = randomNumber(36.5, 40, 0.1)
			diagnosis.bloodPressure = randomBloodPressure()
			diagnosis.respiratoryRate = randomNumber(15, 30)
			diagnosis.spO2 = randomNumber(92, 100)
			diagnosis.height = randomNumber(140, 190)
			diagnosis.weight = randomNumber(35, 105)

			diagnosis.note = faker.lorem.sentence()

			diagnosisListDto.push(diagnosis)
		}

		// await this.diagnosisRepository.save(diagnosisListDto, { transaction: false })
		await this.diagnosisRepository.insert(diagnosisListDto)

		// update all arrival with medical Record Id
		await this.dataSource.manager.query(`
			UPDATE arrival LEFT JOIN diagnosis ON arrival.id = diagnosis.arrival_id 
			SET arrival.diagnosis_id = diagnosis.id
			WHERE diagnosis.oid = ${oid} AND arrival.oid = ${oid}
		`)
	}
}
