import { ValidationError } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import {
  Allow,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  MaxLength,
  validateSync,
} from 'class-validator'
import { MultipleFileUpload } from '../../../../../../_libs/common/dto/file'

class TicketAttributeBody {
  @Expose()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  key: string

  @Expose()
  @Allow()
  value: string
}

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

export class TicketUpdateDiagnosisBody extends MultipleFileUpload {
  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  note: string

  @ApiProperty({
    type: 'string',
    example: JSON.stringify(<TicketAttributeBody[]>[{ key: 'REASON', value: 'Đau bụng' }]),
  })
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        const instance = Object.assign(new TicketAttributeBody(), i)
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
      `Validate ticketAttributeList failed. Value = ${JSON.stringify(value)}. Example: `
      + JSON.stringify(<TicketAttributeBody[]>[{ key: 'REASON', value: 'Đau bụng' }]),
  })
  ticketAttributeChangeList: TicketAttributeBody[]

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => {
    try {
      const err = []
      const result: string[] = JSON.parse(value)
      result.forEach((i) => {
        if (!i || typeof i !== 'string') err.push(i)
      })
      if (err.length) return JSON.stringify(err)
      else return result
    } catch (error) {
      return error.message
    }
  })
  @IsArray()
  @ArrayMinSize(1)
  ticketAttributeKeyList: string[]

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
  @IsObject({ message: ({ value }) => `Validate imagesChange failed. Value = ${value}` })
  imagesChange?: ImagesChangeBody
}
