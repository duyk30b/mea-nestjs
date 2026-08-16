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

export enum PickupStrategy {
  Inherit = 0, // Dùng theo cấu hình mặc định hệ thống
  NoImpact = 1, // Không tác động đến kho
  RequireBatchSelection = 2, // Bắt buộc chọn lô
  AutoWithFIFO = 3, // Auto theo FIFO
  AutoWithExpiryDate = 4, // Auto ưu tiên hạn gần
}

export enum MovementType {
  PurchaseOrder = 1,
  Ticket = 2,
  UserChange = 3,
  StockCheck = 4,
  Excel = 5,
}

export enum DeliveryStatus {
  Empty = 1, // không có hàng trong phiếu, không thể giao hàng
  Pending = 2,
  Partial = 3,
  Delivered = 4,
  Cancelled = 5,
}

export enum AttributeInputType {
  InputText = 'InputText',
  InputNumber = 'InputNumber',
  InputDate = 'InputDate',
  Select = 'Select',
}

export enum AttributeLayoutType {
  Table = 'Bảng',
  InputAndLabelTop = 'Input và Nhãn bên trên',
  InputAndLabelLeft = 'Input và Nhãn bên trái',
}

export enum TicketRegimenStatus {
  Empty = 1,
  Pending = 2,
  Executing = 3,
  Completed = 4,
  Cancelled = 5,
}

export enum TicketLaboratoryStatus {
  Empty = 1,
  Pending = 2,
  Completed = 3,
}

export enum TicketItemPaymentType {
  NoEffect = -1, // không cần thanh toán, không cộng tiền (trường hợp vật tư tiêu hao của dịch vụ)
  TicketPaid = 1,
  PendingPayment = 2,
  PartialPaid = 3,
  FullPaid = 4,
}

export enum TicketActionType {
  TicketOrderDebtSuccessCreate = 1,
  TicketOrderDebtSuccessUpdate = 2,
  ShipProductAndPaymentAndClose = 3,
  PrePayment = 4,
  PaymentMoney = 5,
  PaymentItem = 6,
  RefundMoney = 7,
  RefundItem = 8,
  PayDebt = 9,
  RefundDebt = 10,
  Close = 11,
  Reopen = 12,
  Terminal = 13,
}

export enum PurchaseOrderActionType {
  PurchaseOrderDebtSuccessCreate = 1,
  PurchaseOrderDebtSuccessUpdate = 2,
  ReceiveProductAndPaymentAndClose = 3,
  PrePayment = 4,
  PaymentMoney = 5,
  PaymentItem = 6,
  RefundMoney = 7,
  RefundItem = 8,
  PayDebt = 9,
  RefundDebt = 10,
  Close = 11,
  Reopen = 12,
  Terminal = 13,
}
