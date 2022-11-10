import { Injectable } from '@nestjs/common'
import { Organization, OrganizationSetting } from '_libs/database/entities'
import { OrganizationSettingType } from '_libs/database/entities/organization-setting.entity'
import { DataSource } from 'typeorm'
import { productGroupExampleData } from '../long-nguyen/product.example'

@Injectable()
export class OrganizationSeed {
	constructor(private readonly dataSource: DataSource) { }

	async start(oid: number) {
		await this.dataSource.getRepository(Organization).upsert({
			id: oid,
			email: 'duyk30b@gmail.com',
			phone: '0986021190',
		}, { skipUpdateIfNoValuesChanged: true, conflictPaths: {} })

		const orgProductGroupSetting = this.dataSource.manager.create(OrganizationSetting, {
			oid,
			type: OrganizationSettingType.PRODUCT_GROUP,
			data: JSON.stringify(productGroupExampleData),
		})
		return await this.dataSource
			.createQueryBuilder()
			.insert()
			.into(OrganizationSetting)
			.values(orgProductGroupSetting)
			.orUpdate(['data'], 'IDX_CLINIC_SETTING_TYPE')
			.execute()
	}
}
