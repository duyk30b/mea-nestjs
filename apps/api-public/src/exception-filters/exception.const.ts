export const ErrorMessage = {
	Unknown: 'Unknown',
	Database: {
		UpdateFailed: 'Database.UpdateFailed',
		RemoveFailed: 'Database.RemoveFailed',
	},
	Validate: { Failed: 'Validate.Failed' },
	Token: {
		Expired: 'Token.Expired',
		Invalid: 'Token.Invalid',
		WrongIp: 'Token.WrongIp',
	},
	Register: {
		ExistEmailAndPhone: 'Register.ExistEmailAndPhone',
		ExistEmail: 'Register.ExistEmail',
		ExistPhone: 'Register.ExistPhone',
		ExistUsername: 'Register.ExistUsername',
	},
	User: {
		WrongPassword: 'User.WrongPassword',
		NotExist: 'User.NotExist',
	},
	Organization: { NotExist: 'User.NotExist' },
	Diagnosis: { ConflictArrival: 'Diagnosis.ConflictArrival' },
	Product: { NotFound: 'Product.NotFound' },
	Purchase: { NotFound: 'Purchase.NotFound' },
	Consumable: { NotFound: 'Consumable.NotFound' },
	Provider: { NotFound: 'Provider.NotFound' },
	Customer: { NotFound: 'Customer.NotFound' },
	Invoice: { NotFound: 'Invoice.NotFound' },
	Employee: { NotFound: 'Employee.NotFound' },
	Distributor: { NotFound: 'Distributor.NotFound' },
}
