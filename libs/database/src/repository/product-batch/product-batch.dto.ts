import { ComparisonType } from '_libs/database/common/base.dto'

export class ProductBatchCriteria {
	id?: number
	oid?: number
	productId?: number

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
