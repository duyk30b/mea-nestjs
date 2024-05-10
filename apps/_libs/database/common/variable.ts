export enum EGender {
  Female = 0,
  Male = 1,
}
// type TGenderKey = keyof typeof EGender ==> type: "Male" | "Female"
// type TGenderValue = `${EGender}` ==> type (string): "Male" | "Female"
// Object.keys(EGender ==> ["Male", "Female"]
// Object.values(EGender) ==> ["Male", "Female"]

export enum ERole {
  Root = 0,
  Admin = 1,
  User = 2,
}
// type TRoleKey = keyof typeof ERole ==> type: "Root" | "Admin" | "User"
// type TRoleValue = `${ERole}` ==> type (string): "0" | "1" | "2"
// Object.keys(ERole ==> ["0", "1", "2", "Root", "Admin", "User"]
// Object.values(ERole) ==> ["Root", "Admin", "User", 0, 1, 2]

export enum EOrder {
  ASC,
  DESC,
}
// type TOrderKey = keyof typeof EOrder ==> type: "ASC" | "DESC"
// type TOrderValue = `${EOrder}` ==> type: "0" | "1"
// Object.keys(EOrder ==> ["0", "1", "ASC", "DESC"]
// Object.values(EOrder) ==> ["ASC", "DESC", 0, 1]

export enum DiscountType {
  Percent = '%',
  VND = 'VNĐ',
}

type EnumReverseKeyValue = {
  [P in DiscountType]?: keyof typeof DiscountType
}

export enum DebtType {
  Borrow = 1,
  PayUp = 2,
  Refund = 3,
}

export enum PaymentType {
  ReceiveRefund = -1, // Nhận tiền hoàn trả
  Prepayment = 0, // Thanh toán trước mua hàng
  ImmediatePayment = 1, // Thanh toán ngay khi mua hàng
  PayDebt = 2, // Trả nợ (thanh toán sau mua hàng )
}

export enum InvoiceStatus {
  Refund = -1,
  Draft = 0,
  AwaitingShipment = 1, // Chờ gửi hàng
  Debt = 2,
  Success = 3,
}

export enum ReceiptStatus {
  Refund = -1,
  Draft = 0,
  AwaitingShipment = 1, // Chờ gửi hàng
  Debt = 2,
  Success = 3,
}

export enum InvoiceItemType {
  Batch = 1,
  Procedure = 2,
  Product = 3,
  ProductNoManageQuantity = 4,
}

export enum ArrivalStatus {
  Refund = 0,
  Draft = 1,
  Process = 2,
  Finish = 3,
}

export enum ArrivalType {
  Invoice = 1,
  Normal = 2,
}

export enum MovementType {
  Receipt = 1,
  Invoice = 2,
}
