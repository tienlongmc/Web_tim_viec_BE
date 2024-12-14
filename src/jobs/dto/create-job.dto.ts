//data transfer object class = object
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class CompanyDto {
    @IsMongoId()
    _id: string;
  
    @IsString()
    name: string;

    @IsNotEmpty()
    logo:string;
  }
  
  class UserDto {
    @IsMongoId()
    _id: string;
  
    @IsString()
    email: string;
  }
export class CreateJobDto {
    @IsNotEmpty({message:"name khong duoc trong"})
    name: string;
  
    @IsNotEmpty({message:"skill khong duoc trong"})
    @IsArray({message:"địng dạng là array"})
    @IsString({ each: true ,message:"phải là string"})
    skills: string[];
  
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CompanyDto)
    company: CompanyDto;
  
    @IsNotEmpty({message:"salary khong duoc trong"})
    @IsNumber()
    salary?: number;
  
    @IsNotEmpty({message:"quantity khong duoc trong"})
    @IsNumber()
    quantity?: number;
  
    @IsNotEmpty({message:"level khong duoc trong"})
    @IsString()
    level?: string;

    @IsNotEmpty({message:"location khong duoc trong"})
    @IsString()
    location?: string;
  
    @IsNotEmpty({message:"description khong duoc trong"})
    @IsString()
    description?: string;
  
    @IsNotEmpty({message:"startDate khong duoc trong"})
    @IsDate({message:"định dạng là Date"})
    @Transform(({ value }) => new Date(value))
    @Type(() => Date)
    startDate?: Date;
  
    @IsNotEmpty({message:"endDate khong duoc trong"})
    @IsDate({message:"định dạng là Date"})
    @Transform(({ value }) => new Date(value))
    @Type(() => Date)
    endDate?: Date;

    @IsNotEmpty({message:"IsActive khong duoc trong"})
    @IsBoolean({message:"để kiểu boolean"})
    isActive?: boolean;
  
}
