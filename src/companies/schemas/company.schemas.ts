import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Document } from 'mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';


export type CompanyDocument = HydratedDocument<Company>; // dùng để ánh xạ vào monggodb (tạo table)

@Schema({timestamps:true}) //thêm trương update,create at
export class Company {
    @Prop({required: true} ) //thuộc tính
    name: string;

    @Prop()
    address: string;

    @Prop()
    description: string;

    @Prop({type: Object})
    createdBy:{
        _id:mongoose.Schema.Types.ObjectId;
        email:string;
    }

    @Prop({type: Object})
    updatedBy:{
        _id:mongoose.Schema.Types.ObjectId;
        email:string;
    }

    @Prop({type: Object})
    deletedBy:{
        _id:mongoose.Schema.Types.ObjectId;
        email:string;
    }

    @Prop()
    createdAt: Date;

    @Prop()
    UpdatedAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}
// CompanyDocument = Company & Document;
export const CompanySchema = SchemaFactory.createForClass(Company);
CompanySchema.plugin(softDeletePlugin);