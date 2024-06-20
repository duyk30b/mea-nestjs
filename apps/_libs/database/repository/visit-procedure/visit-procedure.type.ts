import { DiscountType } from '../../common/variable'

export type VisitProcedureUpdateMoneyType = {
  id: number
  procedureId: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
}
