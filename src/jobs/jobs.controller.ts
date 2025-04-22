import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage("Create a new job")
  create(@Body() createJobDto: CreateJobDto,
          @User() user:IUser) {
    return this.jobsService.create(createJobDto,user);
  }

  @Get()
  @Public()
  @ResponseMessage("Fetch list of jobs with pagination")
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string 
  ) {
    return this.jobsService.findAll(+currentPage,+limit,qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage("Fetch job by id")
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update a job")
  update(@Param('id') id: string,
   @Body() updateJobDto: UpdateJobDto
   , @User() user:IUser) {
    return this.jobsService.update(id, updateJobDto,user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a job")
  remove(@Param('id') id: string, @User() user:IUser) {
    return this.jobsService.remove(id,user);
  }
  @Post('search')
  @Public()
  @ResponseMessage("Searching jobs")
  getJobs(@Body() body: { skills: string[]; location: string }) {
  // Xử lý logic tìm kiếm với body.skills và body.location
  return this.jobsService.getJobs(body.skills, body.location);
}

}
