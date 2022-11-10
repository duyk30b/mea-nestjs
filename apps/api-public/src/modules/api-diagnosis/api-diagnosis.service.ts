// import { Injectable } from '@nestjs/common'
// import { ArrivalService } from '_libs/database/modules/arrival'
// import { DiagnosisService } from '_libs/database/modules/diagnosis/diagnosis.service'
// import { BusinessException } from '../../exception-filters/business-exception.filter'
// import { ErrorMessage } from '../../exception-filters/exception.const'
// import { CreateDiagnosisBody, UpdateDiagnosisBody } from './request'

// @Injectable()
// export class ApiDiagnosisService {
// 	constructor(
// 		private readonly diagnosisService: DiagnosisService,
// 		private readonly arrivalService: ArrivalService
// 	) { }

// 	async createOne(oid: number, body: CreateDiagnosisBody) {
// 		const arrival = await this.arrivalService.findOne({ id: body.arrivalId })
// 		if (arrival.diagnosisId) throw new BusinessException(ErrorMessage.Diagnosis.ConflictArrival)

// 		const diagnosis = await this.diagnosisService.insertOne({ oid, ...body })
// 		await this.arrivalService.update(
// 			{ oid, id: body.arrivalId },
// 			{ diagnosisId: diagnosis.id }
// 		)
// 		return diagnosis
// 	}

// 	async updateOne(oid: number, id: number, body: UpdateDiagnosisBody) {
// 		const { affected } = await this.diagnosisService.update({ id, oid }, body)
// 		if (affected !== 1) throw new Error(ErrorMessage.Database.UpdateFailed)

// 		return await this.diagnosisService.findOne({ id })
// 	}
// }
