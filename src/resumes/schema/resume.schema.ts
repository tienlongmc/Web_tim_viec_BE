import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedArraySubdocument, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schemas';
import { Job } from 'src/jobs/schema/job.schema';

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ timestamps: true })
export class Resume {
  @Prop()
  email: string;

  @Prop()
  userId: MongooseSchema.Types.ObjectId;

  @Prop()
  url: string;

  @Prop()
  status: string;

  @Prop({type:mongoose.Schema.Types.ObjectId,ref:Company.name})
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({type:mongoose.Schema.Types.ObjectId,ref:Job.name})
  jobId: MongooseSchema.Types.ObjectId;

  @Prop({type:mongoose.Schema.Types.Array})
  history: {
    status: string;
    updatedAt: Date;
    updatedBy: { _id: MongooseSchema.Types.ObjectId; 
                    email: string };
  }[];

  @Prop()
  deletedAt: Date;
  
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({
    type:Object
  })
  createdBy: { _id: MongooseSchema.Types.ObjectId; email: string };

  @Prop({
    type:Object
  })
  updatedBy: { _id: MongooseSchema.Types.ObjectId; email: string };

  @Prop({
    type:Object
  })
  deletedBy?: { _id: MongooseSchema.Types.ObjectId; email: string };
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
