import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './user.interface';
//controller dùng để phân phối và điều hướng tới những file khác
@Controller('users') //=> /usersrs
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  @ResponseMessage("create a new User")
  @Post()
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
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) { 
    // @param để lấy id trên route
    //const id: string = req.params.id

    return this.usersService.findOne(id); // +id = conver string -> numbere
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update( updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
