import { HttpStatus, ValidationError } from '@nestjs/common'
import { I18nPath } from 'assets/generated/i18n.generated'

export class ValidationException extends Error {
    public errors: ValidationError[]
    constructor(validationErrors: ValidationError[] = []) {
        super('Validate Failed')
        this.errors = validationErrors
    }
}

export class BusinessException extends Error {
    public statusCode: HttpStatus

    constructor(message: I18nPath, statusCode = HttpStatus.BAD_REQUEST) {
        super(message)
        this.statusCode = statusCode
    }
}
