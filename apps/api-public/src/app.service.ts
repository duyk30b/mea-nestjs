import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name)

  async onModuleInit() {
    // this.logger.log('------- Init Module -------')
  }

  getHello(): string {
    return 'MEA-NestJS: Hello World!'
  }
}
