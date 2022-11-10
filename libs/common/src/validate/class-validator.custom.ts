import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'

@ValidatorConstraint({ name: 'isPhone', async: false })
export class IsPhone implements ValidatorConstraintInterface {
	validate(text: string, args: ValidationArguments) {
		if (typeof text !== 'string' || text.length !== 10) return false
		return /((09|03|07|08|05)+([0-9]{8})\b)/g.test(text)
	}

	defaultMessage(args: ValidationArguments) {
		return '$property must be real phone number !'
	}
}

@ValidatorConstraint({ name: 'isGmail', async: false })
export class IsGmail implements ValidatorConstraintInterface {
	validate(text: string, args: ValidationArguments) {
		if (typeof text !== 'string') return false
		return /^([a-zA-Z0-9]|\.|-|_)+(@gmail.com)$/.test(text)
	}

	defaultMessage(args: ValidationArguments) {
		return '$property must be a gmail address !'
	}
}
