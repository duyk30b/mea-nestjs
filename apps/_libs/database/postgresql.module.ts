import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as EntityList from './entities'
import * as ManagerList from './managers'
import * as OperationList from './operations'
import { PostgresqlConfig } from './postgresql.config'
import * as RepositoryList from './repositories'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(PostgresqlConfig)],
      inject: [PostgresqlConfig.KEY],
      useFactory: (sqlConfig: ConfigType<typeof PostgresqlConfig>) => sqlConfig,
    }),
    TypeOrmModule.forFeature(Object.values(EntityList)),
  ],
  providers: [
    ...Object.values(ManagerList),
    ...Object.values(RepositoryList),
    ...Object.values(OperationList),
  ],
  exports: [
    ...Object.values(ManagerList),
    ...Object.values(RepositoryList),
    ...Object.values(OperationList),
  ],
})
export class PostgresqlModule { }
