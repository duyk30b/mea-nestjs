import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { I18nPath, I18nTranslations } from '../../../../assets/generated/i18n.generated'

export type BaseResponse<T = any> = {
  data: T
  meta?: { page: number; limit: number; total: number } | Record<string, any>
  status?: HttpStatus
  message?: I18nPath
  args?: Record<string, any>
  time?: string
}

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const i18n = I18nContext.current<I18nTranslations>()
    return next.handle().pipe(
      map((response: BaseResponse) => ({
        status: response?.status || HttpStatus.OK,
        message: i18n.translate(response?.message || 'common.Success', {
          args: response?.args || {},
        }),
        time: new Date().toISOString(),
        meta: response?.meta,
        data: response?.data,
      }))
    )
  }
}
