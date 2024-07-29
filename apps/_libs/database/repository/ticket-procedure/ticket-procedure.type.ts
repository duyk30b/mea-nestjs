import { DiscountType } from '../../common/variable'

export type TicketProcedureUpdateMoneyType = {
  id: number
  procedureId: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
}
