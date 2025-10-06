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
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { PickupStrategy } from '../../../../../../_libs/database/common/variable'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

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

class TicketProcedureResultBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketProcedureId: string

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsInt()
  completedAt: number

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsString()
  result: string
}

class TicketProductConsumableBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  productId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ enum: PickupStrategy, example: PickupStrategy.AutoWithExpiryDate })
  @Expose()
  @IsDefined()
  @IsEnumValue(PickupStrategy)
  pickupStrategy: PickupStrategy

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsString()
  warehouseIds: string
}

export class TicketProcessResultTicketProcedureBody extends MultipleFileUpload {
  @ApiProperty({ type: 'string' })
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const instance = Object.assign(new TicketProcedureResultBody(), JSON.parse(value))
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
      return `Validate ticketProcedureResult failed. Value = ${value}: `
    },
  })
  ticketProcedureResult: TicketProcedureResultBody

  @ApiProperty({ type: 'string' })
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

  @ApiProperty({ type: 'string' })
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
    message: ({ value }) => `Validate ticketUserResultList failed. Value = ${value}`,
  })
  ticketUserResultList: TicketUserBasicBody[]

  @ApiProperty({ type: 'string' })
  @Expose()
  @Transform(({ value }) => {
    if (value === undefined) return undefined
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        const instance = Object.assign(new TicketProductConsumableBody(), i)
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
    message: ({ value }) => `Validate ticketProductConsumableList failed. Value = ${value}`,
  })
  ticketProductConsumableList: TicketProductConsumableBody[]
}
