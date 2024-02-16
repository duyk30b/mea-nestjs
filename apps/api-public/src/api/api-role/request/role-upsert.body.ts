import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class RoleCreateBody {
  @ApiPropertyOptional({ example: 'Bán hàng' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string // Hoạt chất

  @ApiPropertyOptional({ type: 'string', example: '[{"name":"Viên","rate":1}]' })
  @Expose()
  @Transform(({ value }) => {
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        if (typeof i !== 'number' || i <= 0) {
          err.push(i + ' is not number')
        }
        return i
      })
      if (err.length) return err
      else return JSON.stringify(result)
    } catch (error) {
      return [error.message]
    }
  })
  @IsString({ message: 'Validate permissions failed: Example: ' + JSON.stringify([4, 5, 6]) })
  permissionIds: string

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class RoleUpdateBody extends RoleCreateBody {}
