import { ComparisonType } from '_libs/database/common/base.dto'

export class ProductBatchCondition {
	id?: number
	oid?: number
	productId?: number
	isActive?: boolean

	ids?: number[]
	productIds?: number[]

	quantity?: number | [ComparisonType, string]
	expiryDate?: number | [ComparisonType, string]

	quantityZero?: boolean // lấy số lượng 0
	overdue?: boolean // lấy quá hạn sử dụng
}

export type ProductBatchOrder = {
	[P in 'id' | 'expiryDate']?: 'ASC' | 'DESC'
}
