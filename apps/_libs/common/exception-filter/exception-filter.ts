import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
  Logger,
  NotFoundException,
  ValidationError,
} from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { ThrottlerException } from '@nestjs/throttler'
import { I18nPath, I18nTranslations } from 'assets/generated/i18n.generated'
import { Response } from 'express'
import { FastifyReply, FastifyRequest } from 'fastify'
import { I18nContext } from 'nestjs-i18n'
import { from } from 'rxjs'
import * as url from 'url'
import { RequestExternal } from '../request/external.request'

export class ValidationException extends Error {
  public errors: ValidationError[]
  constructor(validationErrors: ValidationError[] = []) {
    const getMessageError = (validate: ValidationError[]) => {
      return validate
        .map((i) => {
          if (i.constraints) return Object.values(i.constraints).join('. ')
          if (i.children) return getMessageError(i.children)
          return '---------'
        })
        .join('. ')
    }
    const msg = getMessageError(validationErrors)
    super(msg)
    this.errors = validationErrors
  }
}

export class BusinessException extends Error {
  public statusCode: HttpStatus
  public args?: Record<string, string | number>

  constructor(message: I18nPath, args = {}, statusCode = HttpStatus.BAD_REQUEST) {
    super(message)
    this.statusCode = statusCode
    this.args = args
  }
}

@Catch(Error)
export class ServerExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let { message } = exception
    const { stack } = exception
    Logger.error(stack)

    const errors: any[] = (exception as any).errors || []
    const i18n = I18nContext.current<I18nTranslations>(host)

    switch (exception['constructor'].name) {
      case ValidationException.name: {
        statusCode = HttpStatus.UNPROCESSABLE_ENTITY
        break
      }
      case BusinessException.name: {
        message = i18n.translate(exception.message as any, {
          args: (exception as BusinessException).args,
        })
        statusCode = (exception as BusinessException).statusCode
        break
      }
      case ThrottlerException.name: {
        statusCode = HttpStatus.TOO_MANY_REQUESTS
        message = i18n.translate('common.TooManyRequests')
        break
      }
      case NotFoundException.name: {
        statusCode = HttpStatus.NOT_FOUND
        break
      }
      case ForbiddenException.name: {
        statusCode = HttpStatus.FORBIDDEN
        message = i18n.translate('common.Forbidden')
        break
      }
    }

    const [req, res] = host.getArgs()

    if (host.getType() === 'http') {
      const ctx = host.switchToHttp()
      const response = ctx.getResponse<FastifyReply>()
      const request = ctx.getRequest()
      const requestExternal: RequestExternal = request.raw

      const { originalUrl, method, body } = request
      const urlParse = url.parse(originalUrl, true)
      Logger.error(
        JSON.stringify({
          statusCode,
          message,
          type: '[HTTP]',
          method,
          path: urlParse.pathname,
          query: urlParse.query,
          errors,
          body,
          external: requestExternal.external,
        }),
        exception.name
      )

      return response.code(statusCode).send({
        statusCode,
        errors,
        message,
        path: originalUrl,
        time: new Date().toISOString(),
      })
    } else if (host.getType() === 'rpc') {
      if (res.constructor.name === 'NatsContext') {
        // const response = host.switchToRpc().getContext<NatsContext>()
        const response: NatsContext = res
        const info: Record<string, any> = {
          statusCode,
          message,
          errors,
          details: {
            subject: response.getSubject(),
            request: req,
            stack,
          },
        }
        return from([info])
      } else if (res.constructor.name === 'KafkaContext') {
        // const response = host.switchToRpc().getContext<KafkaContext>()
        const response: KafkaContext = res
        const info: Record<string, any> = {
          statusCode,
          message,
          errors,
          details: {
            topic: response.getTopic(),
            partition: response.getPartition(),
            offset: response.getMessage().offset,
            request: req,
          },
        }
        return from([info])
      }
    }
  }
}
