import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/user.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schema/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class ResumesService {
  constructor(
      @InjectModel(Resume.name)
      private resumeModel: SoftDeleteModel <ResumeDocument>
    ){}
  async create(createUserCvDto: CreateUserCvDto,user: IUser) {
   const {url , companyId,jobId} = createUserCvDto;
   const {email,_id} = user;
   const newCV = await this.resumeModel.create({
    url,
    companyId,
    jobId,email,
    userId:_id,
    status:"PENDING",
    history:[{
      status:"PENDING",
      updatedAt:new Date(),
      updatedBy:{
        _id,
        email
      }
    }],
    createdBy:{
      _id:_id,
      email:email
    }
   })
   return {
    _id:newCV?._id,
    createdAt:newCV.createdAt
   }
  }

  async findAll(page: number,limit:number,qs:string) {
    const {filter,sort,population,projection} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population)
    .select(projection as any)
    .exec();
    return {
      meta:{
        current:page,
        pageSize:limit,
        pages:totalPages,
        total:totalItems
      },
      result
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} resume`;
  }

  async update(id: string, status: string, user:IUser) {
   if(!mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException("not found resume")
   }
   const updated = await this.resumeModel.updateOne({
    _id:id
   },{
    status,
    updatedBy:{
      _id:user._id,
      email:user.email
    },
    $push:{ // day them data vao data cu
      history:{
        status:status,
        updatedAt:new Date(),
        updatedBy:{
          _id:user._id,
          email:user.email
        }
      }
    }
   })
   return updated;
  }

   async remove(id: string,user:IUser) {
    await this.resumeModel.updateOne(
      {_id:id},
      {
        deletedBy:{
          _id:user._id,
          email:user.email
        }
      }
    )
    return this.resumeModel.softDelete({_id:id})
  }
   async findByUser(user){
    return await this.resumeModel.find({
  userId:user._id
}).sort("-createdAt")
  }
}
