// import { Injectable } from '@nestjs/common'
// import { InjectRepository } from '@nestjs/typeorm'
// import Diagnosis from '../../entities/diagnosis.entity'
// import { FindOptionsWhere, In, Repository } from 'typeorm'
// import { ConditionDiagnosis } from './diagnosis.dto'

// @Injectable()
// export class DiagnosisRepository {
//     constructor(@InjectRepository(Diagnosis) private readonly diagnosisRepository: Repository<Diagnosis>) { }

//     getWhereOptions(condition: ConditionDiagnosis = {}) {
//         const where: FindOptionsWhere<Diagnosis> = {}
//         if (condition.id != null) where.id = condition.id
//         if (condition.arrivalId != null) where.arrivalId = condition.arrivalId

//         if (condition.ids) {
//             if (condition.ids.length === 0) condition.ids.push(0)
//             where.id = In(condition.ids)
//         }

//         return where
//     }

//     async findOne(condition: ConditionDiagnosis): Promise<Diagnosis> {
//         const where = this.getWhereOptions(condition)
//         return await this.diagnosisRepository.findOne({ where })
//     }

//     async findMany(condition: ConditionDiagnosis): Promise<Diagnosis[]> {
//         const where = this.getWhereOptions(condition)
//         return await this.diagnosisRepository.find({ where })
//     }

//     async insertOne(dto: Partial<Diagnosis>): Promise<Diagnosis> {
//         const product = this.diagnosisRepository.create(dto)
//         return this.diagnosisRepository.save(product)
//     }

//     async update(condition: ConditionDiagnosis, dto: Partial<Omit<Diagnosis, 'id' | 'oid' | 'arrivalId'>>) {
//         const where = this.getWhereOptions(condition)
//         return await this.diagnosisRepository.update(where, dto)
//     }
// }
