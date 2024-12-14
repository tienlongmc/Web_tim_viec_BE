import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { IUser } from 'src/users/user.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel <CompanyDocument>
  ){}

  create(createCompanyDto: CreateCompanyDto, user : IUser) {
    return this.companyModel.create({...createCompanyDto,
      createdBy:{
        _id: user._id,
        email:user.email
      }

    });
  }

  async findAll(page: number, limit: number,qs:string) {
    const{filter,sort,population} = aqp(qs)
    delete filter.current;
    delete filter.pageSize;
    let offset = (+page - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / limit);
    const result = await this.companyModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population)
    .exec(); 

    return {
      meta :{
        current:page,
        pageSize:limit,
        pages:totalPages,
        total:totalItems
      },
      result
      }
    }

  async findOne(id: string) {
   if(!mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException(`not found company`)
   }
   return await this.companyModel.findById(id);
  }

  async update(id: string , updateCompanyDto: UpdateCompanyDto,user: IUser) {
    return await this.companyModel.updateOne(
      {_id:id},
      {...updateCompanyDto,
      updatedBy:{
        _id: user._id,
        email:user.email
      }

    });
  }

  async remove(id: string,user: IUser) {
     await this.companyModel.updateOne(
      { _id : id},
      {
        deletedBy:{
          _id: user._id,
          email:user.email
        }
      }
    )
    return  this.companyModel.softDelete({
        _id : id
    })
  }
}
