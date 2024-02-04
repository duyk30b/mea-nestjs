import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)

  async onModuleInit() {
    // this.logger.log('------- Init Module -------')
  }

  getHello(): string {
    return 'MEA-NestJS: Hello World!'
  }
}
