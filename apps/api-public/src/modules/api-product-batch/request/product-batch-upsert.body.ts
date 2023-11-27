import { ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsBoolean, IsDefined, IsNumber, IsString } from 'class-validator'

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
    @IsDefined()
    @IsNumber()
    costPrice: number

    @ApiPropertyOptional({ example: 59_000 })
    @Expose()
    @IsNumber()
    retailPrice: number

    @ApiPropertyOptional({ example: 45_000 })
    @Expose()
    @IsNumber()
    wholesalePrice: number

    @ApiPropertyOptional({ example: true })
    @Expose()
    @IsBoolean()
    isActive: boolean
}

export class ProductBatchUpdateBody extends OmitType(ProductBatchInsertBody, ['costPrice', 'productId']) {}
