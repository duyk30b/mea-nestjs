import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform } from 'class-transformer'
import { IsIn, IsNotEmpty, IsString } from 'class-validator'

export class DistributorFilterQuery {
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

export class DistributorSortQuery extends SortQuery {
    @ApiPropertyOptional({ name: 'sort[debt]', enum: ['ASC', 'DESC'], example: 'DESC' })
    @Expose()
    @IsIn(['ASC', 'DESC'])
    debt: 'ASC' | 'DESC'

    @ApiPropertyOptional({ name: 'sort[fullName]', enum: ['ASC', 'DESC'], example: 'DESC' })
    @Expose()
    @IsIn(['ASC', 'DESC'])
    fullName: 'ASC' | 'DESC'
}
