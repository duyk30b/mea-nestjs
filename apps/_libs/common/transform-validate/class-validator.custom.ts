import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator'
import { stringEnum, valuesEnum } from '../helpers/typescript.helper'

@ValidatorConstraint({ name: 'isPhone', async: false })
export class IsPhone implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (text === '') return true
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

export function IsNumberGreaterThan(options: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNumberGreaterThan',
      target: object.constructor,
      propertyName,
      constraints: [options],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [options] = args.constraints
          return typeof value === 'number' && value > options
        },
        defaultMessage(args: ValidationArguments) {
          const [options] = args.constraints
          return `$property ($value) must be a number and greater than ${options}`
        },
      },
    })
  }
}

export function IsEnumValue(options: object, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEnumValue',
      target: object.constructor,
      propertyName,
      constraints: [options],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [options] = args.constraints
          const valueOptions = valuesEnum(options)
          return valueOptions.includes(value)
        },
        defaultMessage(args: ValidationArguments) {
          const [options] = args.constraints
          return `$property ($value) must be an enum ${stringEnum(options)}`
        },
      },
    })
  }
}
