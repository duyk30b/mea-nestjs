import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class UserRelationQuery {}

export class UserFilterQuery {
  @ApiPropertyOptional({ name: 'filter[isActive]', example: 1 })
  @Expose()
  @Transform(({ value }) => {
    if (['1', 'true'].includes(value)) return 1
    if (['0', 'false'].includes(value)) return 0
    return undefined
  })
  @IsIn([0, 1])
  isActive: 0 | 1

  @ApiPropertyOptional({ name: 'filter[fullName]' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  fullName: string

  @ApiPropertyOptional({ name: 'filter[phone]' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  phone: string
}

export class UserSortQuery extends SortQuery {
  @ApiPropertyOptional({ name: 'sort[fullName]', enum: ['ASC', 'DESC'], example: 'DESC' })
  @Expose()
  @IsIn(['ASC', 'DESC'])
  fullName: 'ASC' | 'DESC'
}
