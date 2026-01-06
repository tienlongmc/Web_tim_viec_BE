/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CodeAuthDto,
  CreateUserDto,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, User as UserModel } from './schemas/user.schema';
import { User } from 'src/decorator/customize';
import mongoose, { Model, Mongoose } from 'mongoose';
import { genSaltSync, hashSync, compare, compareSync } from 'bcryptjs';
import { IUser } from './user.interface';
import { use } from 'passport';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schema/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from 'src/jobs/schema/job.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
// import { upsertStreamUser } from 'src/chat/stream-chat.service';
import { StreamChat } from 'stream-chat';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name)
    private UserModel: Model<UserModel>, // đặt kiểu type cho biến userModel là model của user trong monggodb

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
    // đặt kiểu type cho biến userModel là model của user trong monggodb
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  getHashPassword = (password: string) => {
    // var bcrypt = require('bcryptjs');
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };
  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    const { name, email, password, age, gender, address, role, company } =
      createUserDto;
    const isExist = await this.UserModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }
    const hashPassword = this.getHashPassword(password); // ma hoa mat khau

    let newUser = await this.UserModel.create({
      email,
      name,
      password: hashPassword,
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newUser;
  }

  async findAll(currenPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currenPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.UserModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.UserModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('-password') // exclude >< include
      .exec();
    return {
      meta: {
        current: currenPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';

    return await this.UserModel.findOne({
      _id: id,
    })
      .select('-password')
      .populate({
        path: 'role',
        select: { name: 1, _id: 1 },
      }); // exclude >< include
  }
  findOneByUsername(username: string) {
    return this.UserModel.findOne({
      email: username,
    }).populate({
      path: 'role',
      select: { name: 1 },
    });
  }

  IsValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { connected, ...rest } = updateUserDto;

    if (connected && connected.length > 0) {
      const updatedUser = await this.UserModel.findByIdAndUpdate(
        id,
        {
          $set: rest,
          $addToSet: { connected: { $each: connected } }, // thêm userId mới, không trùng
        },
        { new: true },
      );
      await this.UserModel.updateMany(
        { _id: { $in: connected } },
        { $addToSet: { connected: id } },
      );
      return updatedUser;
    }

    return await this.UserModel.findByIdAndUpdate(
      id,
      { $set: rest },
      { new: true },
    );
  }

  async remove(id: string) {
    //
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    const foundUser = await this.UserModel.findOne({
      _id: id,
    });
    if (foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('khong the xoa tai khoan admin');
    }
    await this.UserModel.updateOne(
      { _id: id },
      {
        deletedAt: new Date(),
      },
    );
    return this.UserModel.deleteOne({
      _id: id,
    });
  }
  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address, avatar } = user;

    const isExist = await this.UserModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }
    const hashPassword = this.getHashPassword(password);
    const codeID = Math.floor(100000 + Math.random() * 900000);
    const role = await this.roleModel.findOne({ name: 'NORMAL_USER' });
    let newRegister = await this.UserModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      isActive: false,
      role: role._id,
      codeId: codeID,
      avatar,
    });

    this.mailerService.sendMail({
      to: newRegister.email,
      from: '"TOP HIKING JOB" <support@example.com>',
      subject: 'Verify Code Activate your account at TopViec',
      template: 'register',
      context: {
        name: newRegister?.name ?? newRegister.email,
        activationCode: codeID,
      },
    });
    try {
      await this.upsertStreamUser({
        id: newRegister._id.toString(),
        name: newRegister.name,
        image: newRegister.avatar || '',
      });
      console.log(`Stream user created for ${newRegister.name}`);
    } catch (error) {
      console.log('Error creating Stream user:', error);
    }
    return newRegister;
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    const result = await this.UserModel.updateOne(
      { _id }, // Điều kiện tìm kiếm
      { refreshToken }, // Giá trị cần cập nhật
    );

    if (result.modifiedCount === 0) {
      throw new Error('Failed to update refresh token'); // Ném lỗi nếu không cập nhật
    }

    return result; // Trả về thông tin nếu cần
  };
  findUserByToken = async (refreshToken: string) => {
    return await this.UserModel.findOne({
      refreshToken,
    });
  };

  async handeActive(data: CodeAuthDto) {
    const user = await this.UserModel.findOne({
      _id: data._id,
      codeId: data.code,
    });
    if (!user) {
      throw new BadRequestException('Mã code sai');
    } else {
      await this.UserModel.updateOne(
        { _id: data._id },
        {
          isActive: true,
        },
      );
    }
    return user;
  }

  async upsertStreamUser(userData: {
    id: string;
    name?: string;
    image?: string;
  }) {
    try {
      const apiKey = this.configService.get<string>('STREAM_KEY');
      const apiSecret = this.configService.get<string>('STREAM_SECRET');

      if (!apiKey || !apiSecret) {
        console.error(
          'Stream API key or secret is not set in environment variables',
        );
        process.exit(1);
      }

      const streamClient = StreamChat.getInstance(apiKey, apiSecret);
      await streamClient.upsertUsers([userData]);
      return userData;
    } catch (err) {
      console.error('Error upserting Stream user:', err);
      throw new BadRequestException('Cannot upsert Stream user');
    }
  }

  // /**
  //  * Tạo token cho user để client kết nối Stream
  //  */
  getChatToken(userId: string | number): string {
    try {
      const apiKey = this.configService.get<string>('STREAM_KEY');
      const apiSecret = this.configService.get<string>('STREAM_SECRET');
      // console.log("trinh la gi")
      if (!apiKey || !apiSecret) {
        console.error(
          'Stream API key or secret is not set in environment variables',
        );
        process.exit(1);
      }

      const streamClient = StreamChat.getInstance(apiKey, apiSecret);
      return streamClient.createToken(userId.toString());
    } catch (err) {
      console.error('Error generating Stream token:', err);
      throw new BadRequestException('Cannot generate Stream token');
    }
  }

  async getChatList(userId: string) {
    console.log('oi', userId);
    const user = await this.UserModel.findById(userId)
      .populate('connected', '_id name avatar email') // join sang User để lấy field mong muốn
      .exec();
    console.log('oi', user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.connected;
  }
  async changePassword(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // const { password } = updateUserDto;
    const isvaid = this.IsValidPassword(
      updateUserDto.old_password,
      user.password,
    );
    if (isvaid === false) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }
    const newHasPassword = this.getHashPassword(updateUserDto.new_password);
    user.password = newHasPassword;
    await user.save();
    return { message: 'Đổi mật khẩu thành công' };
  }
}
