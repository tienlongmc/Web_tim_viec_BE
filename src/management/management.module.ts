import { Module } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ManagementController } from './management.controller';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Company, CompanySchema } from 'src/companies/schemas/company.schemas';
import { Job, JobSchema } from 'src/jobs/schema/job.schema';
import { Resume, ResumeSchema } from 'src/resumes/schema/resume.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Job.name, schema: JobSchema },
      { name: Resume.name, schema: ResumeSchema },
    ]),
  ],
  controllers: [ManagementController],
  providers: [ManagementService]
})
export class ManagementModule { }
