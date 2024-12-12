import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Resume, ResumeSchema } from './schema/resume.schema';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService],
  imports:[MongooseModule.forFeature([{name: Resume.name,schema:ResumeSchema}])]
})
export class ResumesModule {}
