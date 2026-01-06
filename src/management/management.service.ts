import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { IUser } from 'src/users/user.interface';
import { RoleEnum } from 'src/roles/role.enums';

import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import {
  Company,
  CompanyDocument,
} from 'src/companies/schemas/company.schemas';
import { Job, JobDocument } from 'src/jobs/schema/job.schema';
import { Resume, ResumeDocument } from 'src/resumes/schema/resume.schema';

@Injectable()
export class ManagementService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(user: IUser) {
    if (user.role._id == RoleEnum.NOMAL_USER) {
      throw new ForbiddenException('No permission in here');
    }
    if (user.role._id === RoleEnum.ADMIN) {
      const totalUsers = await this.userModel.countDocuments().exec();
      const totalCompanies = await this.companyModel.countDocuments().exec();
      const totalJobs = await this.jobModel.countDocuments().exec();
      const totalResumes = await this.resumeModel.countDocuments().exec();

      return {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalResumes,
      };
    }

    // Nếu là HR: chỉ lấy số job và resume của công ty HR đó
    if (user.role._id === RoleEnum.HR) {
      if (!user.company._id) {
        throw new ForbiddenException(
          'HR account does not have a company assigned',
        );
      }

      const totalJobs = await this.jobModel
        .countDocuments({ 'company._id': user.company._id })
        .exec();
      const totalResumes = await this.resumeModel
        .countDocuments({ companyId: user.company._id })
        .exec();

      return {
        totalJobs,
        totalResumes,
      };
    }
  }
}
