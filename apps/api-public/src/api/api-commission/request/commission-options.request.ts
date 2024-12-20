import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional } from 'class-validator'
import {
  ConditionNumber,
  createConditionEnum,
  transformConditionEnum,
  transformConditionNumber,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { RoleInteractType } from '../../../../../_libs/database/entities/commission.entity'

const ConditionEnumRoleInteractType = createConditionEnum(RoleInteractType)

export class CommissionRelationQuery {
  @Expose()
  @IsBoolean()
  role: boolean
}

export class CommissionFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, RoleInteractType))
  @IsOptional()
  interactType: RoleInteractType | InstanceType<typeof ConditionEnumRoleInteractType>

  @Expose()
  @IsNumber()
  roleId: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  interactId: number | ConditionNumber
}

export class CommissionSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  interactType: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  roleId: 'ASC' | 'DESC'
}
