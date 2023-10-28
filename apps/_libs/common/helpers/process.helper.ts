import { INestApplicationContext } from '@nestjs/common/interfaces'
import { NestContainer } from '@nestjs/core'

export function getAllControllers(app: INestApplicationContext) {
  const container = (app as any).container as NestContainer
  const modules = container.getModules()
  const result = []
  modules.forEach((module) => {
    const { controllers } = module
    controllers.forEach((controller, type) => {
      result.push(type)
    })
  })
  return result
}
