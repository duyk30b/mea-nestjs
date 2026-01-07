import { Expose, plainToInstance, TransformFnParams } from 'class-transformer'
import { ArrayMinSize, IsArray, IsBoolean, IsMongoId, isMongoId, IsString, validateSync } from 'class-validator'

export class ConditionMongoId {
  @Expose()
  @IsMongoId()
  '=='?: string

  @Expose()
  @IsMongoId()
  'EQUAL'?: string

  @Expose()
  @IsMongoId()
  '!='?: string

  @Expose()
  @IsMongoId()
  'NOT'?: string

  @Expose()
  @IsBoolean()
  'IS_NULL'?: boolean

  @Expose()
  @IsBoolean()
  'NOT_NULL'?: boolean

  @Expose()
  @IsString()
  'LIKE'?: string

  @Expose()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  'IN'?: string[]

  @Expose()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  'NOT_IN'?: string[]
}

export const transformConditionMongoId = ({ value, key }: TransformFnParams) => {
  if (!value) return undefined

  if (typeof value === 'string') {
    const validate = isMongoId(value)
    if (!validate) throw new Error(`${key} must be a mongoID`)
    return value
  } else if (typeof value === 'object') {
    const instance = plainToInstance(ConditionMongoId, value, {
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
      throw new Error(`${key} ConditionMongoID failed: ${validateMessage}`)
    }
    return instance
  } else {
    throw new Error(`${key} must be a mongoID`)
  }
}
