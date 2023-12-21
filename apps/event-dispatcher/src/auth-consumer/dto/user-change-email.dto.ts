// import { Expose, Type } from 'class-transformer'
// import { IsDefined, Validate, ValidateNested } from 'class-validator'
// import { IsGmail } from '../../../../../libs/common/src/transform-validate/class-validator.custom'
// import { KafkaMessageDto } from '../../kafka'

// export class UserChangeEmailData extends KafkaMessageDto {
//     @Expose({ name: 'user_id' })
//     @IsDefined()
//     @Type(() => Number)
//     userId: number

//     @Expose()
//     @Type(() => String)
//     @Validate(IsGmail)
//     email: string
// }

// export class UserChangeEmailDto extends KafkaMessageDto {
//     @Expose()
//     @ValidateNested({ each: true })
//     @Type(() => UserChangeEmailData)
//     data: UserChangeEmailData
// }

// // Example:
// // {
// //     "data": {
// //       "user_id": "67220",
// //       "email": "abc@gmail.com"
// //     },
// //     "created_time": 1673826654345,
// //     "version": 1
// // }
