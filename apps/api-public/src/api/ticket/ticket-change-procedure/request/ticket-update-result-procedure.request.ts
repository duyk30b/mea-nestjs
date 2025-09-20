import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsObject,
  IsString,
  validateSync,
  ValidationError,
} from 'class-validator'
import { MultipleFileUpload } from '../../../../../../_libs/common/dto/file'

export class TicketProcedureUpdateBody extends MultipleFileUpload {
  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsInt()
  completedAt: number

  @ApiProperty({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
  @Expose()
  @IsDefined()
  @IsString()
  result: string
}

class ImagesChangeBody {
  @Expose()
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  imageIdsWait: number[]

  @Expose()
  @IsDefined()
  @IsArray()
  externalUrlList: string[]
}

export class TicketProcedureUpdateResultBody extends MultipleFileUpload {
  @ApiProperty()
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const instance = Object.assign(new TicketProcedureUpdateBody(), JSON.parse(value))
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
    message: ({ value }) => {
      return `Validate imagesChange failed. Value = ${JSON.stringify(value)}: `
    },
  })
  ticketProcedure: TicketProcedureUpdateBody

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
