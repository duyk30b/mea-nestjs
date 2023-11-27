import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class DistributorFilterQuery {
    @ApiPropertyOptional({ name: 'filter[isActive]', example: 'true' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    isActive: boolean

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
