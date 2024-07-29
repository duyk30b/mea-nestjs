import { DiscountType } from '../../common/variable'

export type TicketProductUpdateMoneyType = {
  id: number
  productId: number
  quantity: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
}
