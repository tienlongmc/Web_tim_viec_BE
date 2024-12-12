import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, ['password'] as const) { // không cho cập nhập password
   @IsNotEmpty({message:'_id khong duoc trong'})
    _id:string
}
