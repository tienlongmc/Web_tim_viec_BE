import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './user.interface';

//controller dùng để phân phối và điều hướng tới những file khác
@Controller('users') //=> /usersrs
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  @ResponseMessage("create a new User")
  @Post('post_user')
  async create(
    //cách 1
      // @Body('email') email:string,
      // @Body('password') password:string,
      // @Body('name') name:string,
    //cách 2
    @Body() createUserDto : CreateUserDto, @User() user:IUser
  ) {
    // tag Body = request.body @Body('email') myEmail:string
    //const myemail :string = req.body.email lấy email
    let newUser = await this.usersService.create(createUserDto, user)
    return {
      _id:newUser?._id,
      createdAt:newUser?.createdAt
    };
  }

  @Get()
  @ResponseMessage("Fetch user with pagination")
  findAll(
    @Query('current') currentPage: number,
    @Query('pageSize') limit: number,
    @Query() qs: string //query string (có thể có hoặc không
  ) {
    return this.usersService.findAll(currentPage,limit,qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage("Fetch user by id")
  async findOne(@Param('id') id: string) { 
    // @param để lấy id trên route
    //const id: string = req.params.id
    const foundUser = await this.usersService.findOne(id);

    return foundUser; // +id = conver string -> numbere
  }

  @ResponseMessage("Update a User")
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update( id,updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string,@User() user:IUser) {
    return this.usersService.remove(id);
  }

  // @Post('payment')
  // payment(
  //   res: Response
  // )
  // {return this.usersService.pay(res);

  // }
}
