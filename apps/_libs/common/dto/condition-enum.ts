import { Expose, TransformFnParams, plainToInstance } from 'class-transformer'
import { ArrayMinSize, IsArray, IsBoolean, validateSync } from 'class-validator'
import { stringEnum, valuesEnum } from '../helpers/typescript.helper'
import { IsEnumValue } from '../transform-validate/class-validator.custom'

export function createConditionEnum(enumObject: object) {
  const EValue = valuesEnum(enumObject)
  type T = (typeof EValue)[number]

  class ConditionEnum {
    @Expose()
    @IsEnumValue(enumObject)
    '=='?: T

    @Expose()
    @IsEnumValue(enumObject)
    'EQUAL'?: T

    @Expose()
    @IsEnumValue(enumObject)
    '!='?: T

    @Expose()
    @IsEnumValue(enumObject)
    'NOT'?: T

    @Expose()
    @IsBoolean()
    'IS_NULL'?: boolean

    @Expose()
    @IsBoolean()
    'NOT_NULL'?: boolean

    @Expose()
    @IsArray()
    @ArrayMinSize(1)
    @IsEnumValue(enumObject, { each: true })
    'IN'?: T[]
  }
  return ConditionEnum
}

export const transformConditionEnum = <T>(
  { value, key }: TransformFnParams,
  enumObject: object
) => {
  if (!value) return
  if (typeof value === 'number' || typeof value === 'string') {
    const enumObjectValueList = valuesEnum(enumObject)
    for (let i = 0; i < enumObjectValueList.length; i++) {
      const item = enumObjectValueList[i]
      if (item != value) continue
      if (typeof item === 'number') {
        return Number(value)
      }
      if (typeof item === 'string') {
        return String(value)
      }
    }
    throw new Error(`${key} must be a enum ${stringEnum(enumObject)}`)
  } else if (typeof value === 'object') {
    const ConditionEnum = createConditionEnum(enumObject)
    const instance = plainToInstance(ConditionEnum, value, {
      exposeUnsetFields: false,
      excludeExtraneousValues: false,
    })
    const validate = validateSync(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
    })
    if (validate.length) {
      const validateMessage = JSON.stringify(validate.map((i) => i.constraints))
      throw new Error(`${key} ConditionEnum failed: ${validateMessage}`)
    }
    return instance
  } else {
    throw new Error(`${key} must be a Enum or condition of Enum`)
  }
}
