import { ValidationError } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  Validate,
  validateSync,
} from 'class-validator'
import { MultipleFileUpload } from '../../../../../_libs/common/dto/file'
import { IsPhone } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { EGender } from '../../../../../_libs/database/common/variable'

class ImagesChangeBody {
  @Expose()
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  imageIdWaitList: number[]

  @Expose()
  @IsDefined()
  @IsArray()
  externalUrlList: string[]
}

class UserInfo {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  fullName: string

  @Expose()
  @IsNumber()
  birthday?: number

  @Expose()
  @Validate(IsPhone)
  phone?: string

  @Expose()
  @IsIn([0, 1])
  gender?: EGender
}

export class UserUpdateInfoBody extends MultipleFileUpload {
  @ApiProperty()
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const instance = Object.assign(new UserInfo(), JSON.parse(value))
      const validate = validateSync(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      })
      if (validate.length) {
        const errValidate = validate.map((i: ValidationError) => {
          const { target, ...other } = i
          return other
        })
        return JSON.stringify(errValidate)
      }
      return instance
    } catch (error) {
      return error.message
    }
  })
  @IsObject({
    message: ({ value }) => `Validate userInfo failed. Value = ${JSON.stringify(value)} `,
  })
  userInfo: UserInfo

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const instance = Object.assign(new ImagesChangeBody(), JSON.parse(value))
      const validate = validateSync(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      })
      if (validate.length) {
        const errValidate = validate.map((i: ValidationError) => {
          const { target, ...other } = i
          return other
        })
        return JSON.stringify(errValidate)
      }
      return instance
    } catch (error) {
      return error.message
    }
  })
  @IsObject({
    message: ({ value }) => `Validate imagesChange failed. Value = ${value}`,
  })
  imagesChange?: ImagesChangeBody
}
