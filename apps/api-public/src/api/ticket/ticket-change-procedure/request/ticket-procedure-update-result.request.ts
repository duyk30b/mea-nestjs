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
import { TicketUserBasicBody } from '../../ticket-change-user/request'

export class TicketProcedureItemUpdateBody extends MultipleFileUpload {
  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsInt()
  ticketProcedureItemId: number

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsInt()
  ticketProcedureId: number

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
  @ApiProperty({
    type: 'string',
    example: JSON.stringify(<TicketUserBasicBody[]>[{ userId: 1, roleId: 2 }]),
  })
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        const instance = Object.assign(new TicketUserBasicBody(), i)
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
          err.push(...errValidate)
        }
        return instance
      })
      if (err.length) return JSON.stringify(err)
      else return result
    } catch (error) {
      return error.message
    }
  })
  @IsArray({
    message: ({ value }) =>
      `Validate TicketUserBasicBody failed. Value = ${JSON.stringify(value)}.`,
  })
  ticketUserList: TicketUserBasicBody[]

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const instance = Object.assign(new TicketProcedureItemUpdateBody(), JSON.parse(value))
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
  ticketProcedureItem: TicketProcedureItemUpdateBody

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
