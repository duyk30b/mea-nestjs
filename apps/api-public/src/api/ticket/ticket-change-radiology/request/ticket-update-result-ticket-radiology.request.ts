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
import * as DOMPurify from 'isomorphic-dompurify'
import { MultipleFileUpload } from '../../../../../../_libs/common/dto/file'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

export class TicketRadiologyUpdateBody extends MultipleFileUpload {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  printHtmlId: number

  @ApiProperty({ example: 'Mổ viêm ruột thừa 2002' })
  @Expose()
  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsDefined()
  @IsString()
  description: string

  @ApiProperty({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
  @Expose()
  @IsDefined()
  @IsString()
  result: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  customStyles: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  customVariables: string

  @ApiProperty({ example: Date.now() })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  completedAt: number
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

export class TicketUpdateResultTicketRadiologyBody extends MultipleFileUpload {
  @ApiProperty({
    type: 'string',
    example: JSON.stringify(<TicketUserBasicBody[]>[{ userId: 1, positionId: 2 }]),
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
  ticketUserResultList: TicketUserBasicBody[]

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const instance = Object.assign(new TicketRadiologyUpdateBody(), JSON.parse(value))
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
  ticketRadiology: TicketRadiologyUpdateBody

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
