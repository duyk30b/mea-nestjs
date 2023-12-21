import { ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsIn, IsNumber, IsString } from 'class-validator'

export class ProductBatchInsertBody {
    @ApiPropertyOptional({ example: 12 })
    @Expose()
    @IsNumber()
    productId: number

    @ApiPropertyOptional({ example: 'ABC12345' })
    @Expose()
    @IsDefined()
    @IsString()
    batch: string

    @ApiPropertyOptional({ example: 1679995369195 })
    @Expose()
    @IsNumber()
    expiryDate: number

    @ApiPropertyOptional({ example: 20_000 })
    @Expose()
    @Transform(({ value }) => Math.round(value || 0))
    @IsDefined()
    @IsNumber()
    costPrice: number

    @ApiPropertyOptional({ example: 59_000 })
    @Expose()
    @Transform(({ value }) => Math.round(value || 0))
    @IsNumber()
    retailPrice: number

    @ApiPropertyOptional({ example: 45_000 })
    @Expose()
    @Transform(({ value }) => Math.round(value || 0))
    @IsNumber()
    wholesalePrice: number

    @ApiPropertyOptional({ example: 1 })
    @Expose()
    @IsIn([0, 1])
    isActive: 0 | 1
}

export class ProductBatchUpdateBody extends OmitType(ProductBatchInsertBody, ['costPrice', 'productId']) {}
