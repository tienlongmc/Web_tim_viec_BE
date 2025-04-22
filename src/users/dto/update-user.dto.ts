import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// export class UpdateUserDto extends OmitType(CreateUserDto, ['password'] as const) { // không cho cập nhập password
// //    @IsNotEmpty({message:'_id khong duoc trong'})
// //     _id:string
// }

export class UpdateUserDto {
    // @IsNotEmpty({ message: "_id không được để trống" })
    // @IsString()
    // _id: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: "Email không hợp lệ" })
    email?: string;

    @IsOptional()
    @IsNotEmpty({ message: "tuổi không được để trống" })
    age?: number;

    @IsOptional()
    @IsString()
    address?: string;
}
