import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) { }

  // @Post()
  // create(@Body() createManagementDto: CreateManagementDto) {
  //   return this.managementService.create(createManagementDto);
  // }

  @Get()
  Statistic(
    @User() user: IUser
  ) {
    return this.managementService.findAll(user);
  }

 
}
