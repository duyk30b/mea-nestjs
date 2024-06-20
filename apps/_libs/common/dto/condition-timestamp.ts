import { Expose, Transform, TransformFnParams, plainToInstance } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  validateSync,
} from 'class-validator'

export class ConditionTimestamp {
  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  '>'?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  'GT'?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  '>='?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  'GTE'?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  '<'?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  'LT'?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  '<='?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  'LTE'?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  '=='?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  'EQUAL'?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  '!='?: number

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return new Date(value).getTime()
  })
  @IsNumber()
  'NOT'?: number

  @Expose()
  @IsBoolean()
  'IS_NULL'?: boolean

  @Expose()
  @IsBoolean()
  'NOT_NULL'?: boolean

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return value.map((v: string | number) => new Date(v).getTime())
  })
  @IsNumber({}, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  'IN'?: number[]

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return value.map((v: string | number) => new Date(v).getTime())
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  'BETWEEN'?: [number, number]
}

export const transformConditionTimestamp = ({ value, key }: TransformFnParams) => {
  if (!value) {
    return
  }
  if (typeof value === 'number') {
    return value
  } else if (typeof value === 'object') {
    const instance = plainToInstance(ConditionTimestamp, value, {
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
      throw new Error(`${key} ConditionTimestamp failed: ${validateMessage}`)
    }
    return instance
  } else {
    throw new Error(`${key} must be a Number or condition of Number`)
  }
}
