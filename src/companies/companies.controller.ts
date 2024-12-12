import { Controller, Get, Post, Body, Patch, Param, Delete, Query, } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
// import { Request } from 'express';
import { Public,ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { Company } from './schemas/company.schemas';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user : IUser) {
    return this.companiesService.create(createCompanyDto,user);
  }

  // @Get()
  // findAll() {
  //   return this.companiesService.findAll();
  // }
  @Get()
  @Public()
  @ResponseMessage("Fetch list of companies with paginate")
  async findAll(
    @Query('page') page: number = 1, // Tham số trang
    @Query('limit') limit: number = 2 // Tham số giới hạn tài liệu
  ): Promise<{ data: Company[], total: number }> {
    return this.companiesService.findAll(page, limit);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @User() user : IUser) {
    return this.companiesService.update(id, updateCompanyDto,user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user: IUser) 
    {
      return this.companiesService.remove(id,user);
    }
}
