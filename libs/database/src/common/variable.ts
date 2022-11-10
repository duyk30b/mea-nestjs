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
	User = 2
}
// type TRoleKey = keyof typeof ERole ==> type: "Root" | "Admin" | "User"
// type TRoleValue = `${ERole}` ==> type (string): "0" | "1" | "2" 
// Object.keys(ERole ==> ["0", "1", "2", "Root", "Admin", "User"]
// Object.values(ERole) ==> ["Root", "Admin", "User", 0, 1, 2]

export enum EOrder {
	ASC,
	DESC
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
	[P in DiscountType]?: keyof typeof DiscountType;
}

export enum DebtType {
	Borrow = 1,
	PayUp = 2,
	Refund = 3,
}

export enum PaymentStatus {
	Unknown = 0,
	Unpaid = 1,
	Partial = 2,
	Full = 3,
	Refund = 4,
}

export enum ProductMovementType {
	Receipt = 1,
	Invoice = 2,
}

export enum InvoiceItemType {
	ProductBatch = 1,
	Procedure = 2,
}

export enum ArrivalStatus {
	Unknown = 0,
	Waiting = 1,
	Examining = 2,
	Paying = 3,
	Finish = 4,
}

export enum ArrivalType {
	Invoice = 1,
	Normal = 2,
}
