import { Expose } from 'class-transformer'
import { IsArray, IsBoolean, IsNumber } from 'class-validator'

export class ConditionNumber {
  @Expose()
  @IsNumber()
  '>'?: number

  @Expose()
  @IsNumber()
  'GT'?: number

  @Expose()
  @IsNumber()
  '>='?: number

  @Expose()
  @IsNumber()
  'GTE'?: number

  @Expose()
  @IsNumber()
  '<'?: number

  @Expose()
  @IsNumber()
  'LT'?: number

  @Expose()
  @IsNumber()
  '<='?: number

  @Expose()
  @IsNumber()
  'LTE'?: number

  @Expose()
  @IsNumber()
  '=='?: number

  @Expose()
  @IsNumber()
  'EQUAL'?: number

  @Expose()
  @IsNumber()
  '!='?: number

  @Expose()
  @IsNumber()
  'NOT'?: number

  @Expose()
  @IsBoolean()
  'IS_NULL'?: boolean

  @Expose()
  @IsBoolean()
  'NOT_NULL'?: boolean

  @Expose()
  @IsArray()
  'IN'?: number[]

  @Expose()
  @IsArray()
  'BETWEEN'?: [number, number]
}
