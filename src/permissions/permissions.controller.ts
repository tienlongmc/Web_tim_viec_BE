import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ResponseMessage("Create a new permission")
  create(@Body() createPermissionDto: CreatePermissionDto,@User() user:IUser) {
    return this.permissionsService.create(createPermissionDto,user);
  }

  @Get()
  @ResponseMessage("Fetch permission with pagination")
  findAll(
    @Param('page') page:string,
    @Param('limit') limit:string,
    @Param() qs:string

  ) {
    return this.permissionsService.findAll(+page,+limit,qs);
  }

  @Get(':id')
  @ResponseMessage("Fetch permission by id")
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update permission")
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto,@User() user:IUser) {
    return this.permissionsService.update(id, updatePermissionDto,user);
  }

  @Delete(':id')
  @ResponseMessage("Delete permission")
  remove(@Param('id') id: string,@User() user:IUser) {
    return this.permissionsService.remove(id,user);
  }
}
