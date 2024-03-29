import { Expose, Transform } from 'class-transformer'
import { IsArray, IsBoolean, IsNumber } from 'class-validator'

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
  @IsArray()
  'IN'?: number[]

  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined
    return value.map((v: string | number) => new Date(v).getTime())
  })
  @IsArray()
  'BETWEEN'?: [number, number]
}
