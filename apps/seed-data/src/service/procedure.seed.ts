import { Injectable } from '@nestjs/common'
import { Procedure } from '_libs/database/entities'
import { DataSource } from 'typeorm'
import { randomNumber } from '_libs/common/helpers/random.helper'
import { convertViToEn } from '_libs/common/helpers/string.helper'
import { procedureExampleData } from '../procedure/procedure.example'

@Injectable()
export class ProcedureSeed {
	constructor(private readonly dataSource: DataSource) { }

	async start(oid: number) {
		const countProcedure = await this.dataSource.getRepository(Procedure).count()
		if (countProcedure) return

		const proceduresDto: Procedure[] = []
		for (let i = 0; i < procedureExampleData.length; i++) {
			const procedure = new Procedure()
			const procedureName = procedureExampleData[i]

			procedure.oid = oid
			procedure.nameVi = procedureName
			procedure.nameEn = convertViToEn(procedureName)
			procedure.price = randomNumber(500_000, 20_000_000, 100)
			procedure.isActive = true
			proceduresDto.push(procedure)
		}

		// await this.dataSource.getRepository(Procedure).save(proceduresDto, { transaction: false })
		await this.dataSource.getRepository(Procedure).insert(proceduresDto)
	}
}
