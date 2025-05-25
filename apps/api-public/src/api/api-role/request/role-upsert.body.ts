import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsDefined, IsIn, IsString } from 'class-validator'

export class RoleCreateBody {
  @ApiPropertyOptional({ example: 'DOCTOR' })
  @Expose()
  @IsDefined()
  @IsString()
  roleCode: string

  @ApiPropertyOptional({ example: 'Bác sĩ' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string

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

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsDefined()
  @IsArray()
  userIdList: number[]
}

export class RoleUpdateBody extends RoleCreateBody { }
