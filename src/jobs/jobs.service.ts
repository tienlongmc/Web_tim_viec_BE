import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from './schema/job.schema';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class JobsService {  
  constructor(
    @InjectModel(Job.name)  // tiêm mongo vào biến 
    private JobModel: SoftDeleteModel<JobDocument> // đặt kiểu type cho biến userModel là model của user trong monggodb
  ){ } 

  async create(createJobDto: CreateJobDto,user:IUser) {
    const{
      name,skills,company,salary,quantity,level,description,startDate,endDate,isActive,location
    } = createJobDto;
    let newJob = await this.JobModel.create({
      name,skills,company,salary,quantity,level,description,startDate,endDate,isActive,location,
      createdBy:{
        _id:user._id,
        email:user.email
      }
    })
  }

  async findAll(page:number,limit:number,qs:string) {
    const {filter,sort,population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.JobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.JobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
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

  async findOne(id: string) {
   if(!mongoose.Types.ObjectId.isValid(id))
    return `not found job`

   return await this.JobModel.findById(id);
  }

 async update(id: string, updateJobDto: UpdateJobDto,user: IUser) { 
    const updated = await this.JobModel.updateOne(
      {_id:id},
      {
        ...updateJobDto,
        updatedBy:{
          _id:user._id,
          email:user.email
        }
      }
    );
    return updated
  }

async  remove(id: string,user:IUser) {
   if(!mongoose.Types.ObjectId.isValid(id))
    return `not found job`

   await this.JobModel.updateOne(
    {_id:id},
    {
      deletedBy:{
        _id:user._id,
        email:user.email
      },
      isActive:"false"
    }
  )
  // return this.JobModel.softDelete({_id:id})

  
  }
}
