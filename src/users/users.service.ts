import { BadRequestException, Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { CodeAuthDto, CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, User as UserModel  } from './schemas/user.schema';
import { User } from 'src/decorator/customize';
import mongoose, { Model, Mongoose } from 'mongoose';
import {genSaltSync,hashSync,compare, compareSync} from 'bcryptjs'
import { IUser } from './user.interface';
import { use } from 'passport';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schema/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from 'src/jobs/schema/job.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(UserModel.name)
    private UserModel: Model<UserModel>,// đặt kiểu type cho biến userModel là model của user trong monggodb
    
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
    // đặt kiểu type cho biến userModel là model của user trong monggodb
    private readonly mailerService: MailerService 
  ) { } 

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

   async findAll(currenPage:number,limit:number,qs:string) {
   const {filter,sort,population} = aqp(qs);
   delete filter.current;
   delete filter.pageSize;

   let offset = (+currenPage -1) * (+limit);
   let defaultLimit = +limit ? +limit : 10;
   const totalItems = (await this.UserModel.find(filter)).length;
   const totalPages = Math.ceil(totalItems / defaultLimit);

   const result = await this.UserModel.find(filter)
   .skip(offset)
   .limit(defaultLimit)
   .sort(sort as any)
   .populate(population)
   .select("-password") // exclude >< include
   .exec();
   return{
    meta:{
      current:currenPage,
      pageSize:limit,
      pages:totalPages,
      total:totalItems
    },
    result
   }
  }

  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id))
      return "not found user";

    return await this.UserModel.findOne({
      _id: id
    }
    ).select("-password")
    .populate({
      path:"role",
      select:{name:1,_id:1}
    }) // exclude >< include
  }
  findOneByUsername(username: string) {
    return this.UserModel.findOne({
      email: username
    }
    ).populate({
      path:"role",
      select:{name:1}
    })
  }

  IsValidPassword(password:string, hash:string){
    return compareSync(password, hash);
  }

  async update(id:string, updateUserDto: UpdateUserDto) {
    return await this.UserModel.updateOne({_id :id},{...updateUserDto})
  }

  async remove(id: string) {
    //
    if(!mongoose.Types.ObjectId.isValid(id))
      return "not found user";
    const foundUser = await this.UserModel.findOne({
      _id: id
    })
    if(foundUser.email ==="admin@gmail.com"){
        throw new BadRequestException("khong the xoa tai khoan admin")
    } 
   await this.UserModel.updateOne(
      {_id:id},
      {
        deletedAt: new Date()
      }
    )
    return this.UserModel.deleteOne({
      _id: id
    }
    )
  }
  async register(user: RegisterUserDto) {
    const{name,email,password,age,gender,address,avatar} = user;

    const isExist = await this.UserModel.findOne({email});
    if(isExist){
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }
    const hashPassword = this.getHashPassword(password);
    const codeID = Math.floor(100000 + Math.random() * 900000);
    const role = await this.roleModel.findOne({ name: 'NORMAL_USER' });
    let newRegister = await this.UserModel.create({
      name,
      email,
      password:hashPassword,
      age,
      gender,
      address,
      isActive:false,
      role:role._id,
      codeId: codeID,
      avatar
    })

    this.mailerService.sendMail({
      to :newRegister.email,
      from: '"TOP HIKING JOB" <support@example.com>',
      subject:'Verify Code Activate your account at TopViec',
      template:'register',
      context:{
        name:newRegister?.name ?? newRegister.email,
        activationCode:codeID
      }
    });
    return newRegister;
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    const result = await this.UserModel.updateOne(
      { _id }, // Điều kiện tìm kiếm
      { refreshToken } // Giá trị cần cập nhật
    );
  
    if (result.modifiedCount === 0) {
      throw new Error('Failed to update refresh token'); // Ném lỗi nếu không cập nhật
    }
  
    return result; // Trả về thông tin nếu cần
  };
  findUserByToken = async (refreshToken: string) => {
    return await this.UserModel.findOne({
      refreshToken
    });
  };

  async handeActive(data:CodeAuthDto){
    const user = await this.UserModel.findOne({
      _id:data._id,codeId: data.code})
      if(!user){
        throw new BadRequestException("Mã code sai")
      }else{
        await this.UserModel.updateOne({_id:data._id},{
          isActive:true
        })
      }
    return user;
  }
}
