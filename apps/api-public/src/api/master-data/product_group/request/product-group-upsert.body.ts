import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'

export class ProductGroupCreateBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string
}

export class ProductGroupUpdateBody extends PartialType(ProductGroupCreateBody) { }

export class ProductGroupReplaceBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  id: number
}

export class ProductGroupReplaceAllBody {
  @ApiProperty({ type: ProductGroupReplaceBody, isArray: true })
  @Expose()
  @Type(() => ProductGroupReplaceBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  productGroupReplaceAll: ProductGroupReplaceBody[]
}