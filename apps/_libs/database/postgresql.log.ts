import { highlight } from 'cli-highlight'
import { format } from 'sql-formatter'
import { Logger, QueryRunner } from 'typeorm'

export class PrettySqlLogger implements Logger {
  paramType: 'PrepareExecute' | 'ReplaceParam'
  constructor(data: { paramType: 'PrepareExecute' | 'ReplaceParam' }) {
    this.paramType = data.paramType
  }

  private replaceParam(query: string, parameters?: unknown[]) {
    if (!parameters?.length) return query
    let result = query
    parameters.forEach((param, index) => {
      let formatted = ''
      if (param === null || param === undefined) {
        formatted = 'NULL'
      } else if (typeof param === 'string') {
        formatted = `'${param.replace(/'/g, "''")}'`
      } else {
        formatted = param as any
      }
      // Replace only the first occurrence of $<index + 1>
      result = result.replace(new RegExp(`\\$${index + 1}\\b`), String(formatted))
    })
    return result
  }

  private guessPostgresType(value: any): string {
    if (value === null || value === undefined) return 'text'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float'
    if (typeof value === 'string') {
      if (/^[0-9a-f-]{36}$/i.test(value)) return 'uuid'
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'timestamp'
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date'
      return 'text'
    }
    if (value instanceof Date) return 'timestamp'
    if (Buffer.isBuffer(value)) return 'bytea'
    if (Array.isArray(value)) return `${this.guessPostgresType(value[0])}[]`
    if (typeof value === 'object') return 'jsonb'
    return 'text'
  }

  private guessAndFormatParamValue(value: any): string {
    if (value === null || value === undefined) return 'NULL'
    if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
    return value.toString()
  }

  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    if (process.env.NODE_ENV === 'production') return
    let executeQuery = query
    if (parameters?.length) {
      if (this.paramType === 'PrepareExecute') {
        const types = (parameters ?? []).map(this.guessPostgresType).join(', ')
        const values = (parameters ?? []).map(this.guessAndFormatParamValue).join(', ')
        executeQuery = `PREPARE my_query(${types}) AS\n${query};\nEXECUTE my_query(${values});`
      } else if (this.paramType === 'ReplaceParam') {
        executeQuery = this.replaceParam(query, parameters)
      }
    }

    const formattedQuery = format(executeQuery, {
      language: 'postgresql',
      newlineBeforeSemicolon: false,
      logicalOperatorNewline: 'before',
      linesBetweenQueries: 0,
      expressionWidth: 160,
    })
    const highlightedQuery = highlight(formattedQuery, {
      language: 'sql',
      ignoreIllegals: true,
    })
    console.log('\n======== 📦 PostgreSQL Query ========')
    console.log(highlightedQuery)
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner
  ) {
    console.error('==== QUERY ERROR ====')
    console.error(format(query, { language: 'postgresql' }))
    console.error('PARAMETERS:', parameters)
    console.error('ERROR:', error)
  }

  logQuerySlow(time: number, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    console.warn(`==== SLOW QUERY (${time}ms) ====`)
    console.warn(format(query, { language: 'postgresql' }))
    console.warn('PARAMETERS:', parameters)
  }

  logSchemaBuild(message: string) {
    console.log('Schema build:', message)
  }

  logMigration(message: string) {
    console.log('Migration:', message)
  }

  log(level: 'log' | 'info' | 'warn', message: any) {
    console[level](message)
  }
}
