import { BadRequestException, Injectable } from '@nestjs/common';
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
    @InjectModel(Job.name) // tiêm mongo vào biến
    private JobModel: SoftDeleteModel<JobDocument>, // đặt kiểu type cho biến userModel là model của user trong monggodb
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name,
      skills,
      company,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
      location,
    } = createJobDto;
    let newJob = await this.JobModel.create({
      name,
      skills,
      company,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
      location,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
     return newJob;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * limit;
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
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `not found job`;

    return await this.JobModel.findById(id);
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const updated = await this.JobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `not found job`;

    await this.JobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
        isActive: 'false',
      },
    );
    // return this.JobModel.softDelete({_id:id})
  }
  async getJobs(skills: string[], location: string, search: string) {
    // Tạo bộ lọc động dựa trên đầu vào
    const filter: any = {};
    if (skills && skills.length > 0) {
      filter.skills = { $all: skills }; // Kiểm tra các kỹ năng bắt buộc
    }

    if (location) {
      filter.location = { $regex: new RegExp(location, 'i') }; // So khớp location không phân biệt hoa thường
    }
    if (search) {
      filter.name = { $regex: new RegExp(search, 'i') }; // Tìm theo tên công việc
    }

    // Nếu không có bất kỳ điều kiện nào
    if (Object.keys(filter).length === 0) {
      throw new BadRequestException(
        'Please provide at least one search criteria: skills or location',
      );
    }

    // Lọc công việc dựa trên filter
    const filteredJobs = await this.JobModel.find(filter).exec();

    // Nếu không tìm thấy công việc nào
    if (filteredJobs.length === 0) {
      throw new BadRequestException('No jobs found matching the criteria');
    }

    // Trả về danh sách công việc phù hợp
    return filteredJobs;
  }
}
