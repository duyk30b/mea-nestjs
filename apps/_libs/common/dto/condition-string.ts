import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'

export class ConditionString {
  @Expose()
  @IsString()
  '=='?: string

  @Expose()
  @IsString()
  'EQUAL'?: string

  @Expose()
  @IsString()
  '!='?: string

  @Expose()
  @IsString()
  'NOT'?: string

  @Expose()
  @IsString()
  'IS_NULL'?: boolean

  @Expose()
  @IsString()
  'NOT_NULL'?: boolean

  @Expose()
  @IsString()
  'LIKE'?: string

  @Expose()
  @IsString()
  'IN'?: string[]
}
