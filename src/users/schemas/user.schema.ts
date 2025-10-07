import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from 'src/roles/schema/role.schema';

export type UserDocument = HydratedDocument<User>; // dùng để ánh xạ vào monggodb (tạo table)

@Schema({ timestamps: true }) //thêm trương update,create at
export class User {
  @Prop()
  name: string;

  @Prop({ required: true }) //thuộc tính
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  age: number;

  @Prop()
  gender: string

  @Prop()
  address: string;

  @Prop({ type: Object })
  company: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  }


  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: mongoose.Types.ObjectId;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  }

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  }

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  }

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;


  @Prop()
  codeId: string;

  @Prop()
  isActive: boolean;

  @Prop()
  avatar: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }], default: [] })
  connected: mongoose.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);