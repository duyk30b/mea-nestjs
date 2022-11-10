import { Expose } from 'class-transformer'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../common/base.entity'

export enum OrganizationSettingType {
	PRODUCT_GROUP = 'PRODUCT_GROUP',
	PRODUCT_UNIT = 'PRODUCT_UNIT',
	PRODUCT_ROUTE = 'PRODUCT_ROUTE',
	PROCEDURE_GROUP = 'PROCEDURE_GROUP',

	SCREEN_PRODUCT_LIST = 'SCREEN_PRODUCT_LIST',

	SCREEN_PURCHASE_RECEIPT_LIST = 'SCREEN_PURCHASE_RECEIPT_LIST',
	SCREEN_PURCHASE_RECEIPT_DETAIL = 'SCREEN_PURCHASE_RECEIPT_DETAIL',
	SCREEN_PURCHASE_RECEIPT_UPSERT = 'SCREEN_PURCHASE_RECEIPT_UPSERT',

	SCREEN_INVOICE_ARRIVAL_LIST = 'SCREEN_INVOICE_ARRIVAL_LIST',
	SCREEN_INVOICE_ARRIVAL_DETAIL = 'SCREEN_INVOICE_ARRIVAL_DETAIL',
	SCREEN_INVOICE_ARRIVAL_UPSERT = 'SCREEN_INVOICE_ARRIVAL_UPSERT',

	SCREEN_CUSTOMER_LIST = 'SCREEN_CUSTOMER_LIST',
	SCREEN_CUSTOMER_DETAIL = 'SCREEN_CUSTOMER_DETAIL',

	SCREEN_DISTRIBUTOR_LIST = 'SCREEN_DISTRIBUTOR_LIST',
	SCREEN_DISTRIBUTOR_DETAIL = 'SCREEN_DISTRIBUTOR_DETAIL',

	SCREEN_PROCEDURE_LIST = 'SCREEN_PROCEDURE_LIST',
	SCREEN_PROCEDURE_DETAIL = 'SCREEN_PROCEDURE_DETAIL',
}

@Entity('organization_setting')
@Index('IDX_ORG_SETTING_TYPE', ['oid', 'type'], { unique: true })
export default class OrganizationSetting extends BaseEntity {
	@Column({ name: 'type', type: 'varchar' })
	@Expose({ name: 'type' })
	type: OrganizationSettingType

	@Column({ name: 'data', type: 'text' })
	@Expose({ name: 'data' })
	data: string                              // Dạng JSON
}
