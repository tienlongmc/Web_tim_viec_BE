import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/user.interface';
import { ResponseMessage, User } from 'src/decorator/customize';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessage("Create a resume")
  create(@Body() createUserCvDto: CreateUserCvDto,@User() user:IUser) {
    return this.resumesService.create(createUserCvDto,user);
  }

  @Post('by-user')
  @ResponseMessage("Get resume by user")
  getResumeByUser(@User() user: IUser) {
    return this.resumesService.findByUser(user);
  }


  @Get()
  @ResponseMessage("Fetch list of resumes")
  findAll(
    @Query('current') page: string,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.resumesService.findAll(+page,+limit,qs);
  }

  @Get(':id')
  @ResponseMessage("Fetch resume by id")
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update status resume")
  updateStatus(@Param('id') id: string, @Body("status") status: string, @User() user:IUser) {
    return this.resumesService.update(id, status,user);
  }

  @Delete(':id')
  remove(@Param('id') id: string,@User() user:IUser) {
    return this.resumesService.remove(id,user);
  }
}
