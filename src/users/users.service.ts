import { BadRequestException, Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserModel  } from './schemas/user.schema';
import { User } from 'src/decorator/customize';
import mongoose, { Model, Mongoose } from 'mongoose';
import {genSaltSync,hashSync,compare, compareSync} from 'bcryptjs'
import { IUser } from './user.interface';
import { use } from 'passport';


@Injectable()
export class UsersService {

  constructor(
    @InjectModel(UserModel.name)  // tiêm mongo vào biến 
    private UserModel: Model<UserModel>) // đặt kiểu type cho biến userModel là model của user trong monggodb
      { } 

  getHashPassword = (password :string) =>{
    // var bcrypt = require('bcryptjs');
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt); 
    return hash; 
  }
  async create(createUserDto: CreateUserDto, @User() user: IUser) {
      const{name, email,password,age,gender, address,role,company} = createUserDto;
      const isExist = await this.UserModel.findOne({email});
      if(isExist){
        throw new BadRequestException(`Email ${email} đã tồn tại`);
      }
      const hashPassword = this.getHashPassword(password); // ma hoa mat khau

      let newUser = await this.UserModel.create({
        email,name,
        password:hashPassword,
        age,gender,address,role,company,
        createdBy:{
          _id:user._id,
          email:user.email
        }
      })
    return newUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id))
      return "not found user";

    return this.UserModel.findOne({
      _id: id
    }
    )
  }
  findOneByUsername(username: string) {
    // if(!mongoose.Types.ObjectId.isValid(email))
    //   return "not found user";

    return this.UserModel.findOne({
      email: username
    }
    )
  }

  IsValidPassword(password:string, hash:string){
    return compareSync(password, hash);
  }

  async update( updateUserDto: UpdateUserDto) {
    return await this.UserModel.updateOne({_id :updateUserDto._id},{...updateUserDto})
  }

  remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id))
      return "not found user";

    return this.UserModel.deleteOne({
      _id: id
    }
    )
  }
  async register(user: RegisterUserDto) {
    const{name,email,password,age,gender,address} = user;

    const isExist = await this.UserModel.findOne({email});
    if(isExist){
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }
    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.UserModel.create({
      name,
      email,
      password:hashPassword,
      age,
      gender,
      address,
      role:"USER"
    })
    return newRegister;
  }
  updateUserToken =async (refreshToken:string , _id:string)=>{
    return await this.UserModel.updateOne({_id},
      {
        refreshToken
      })
  }
}
