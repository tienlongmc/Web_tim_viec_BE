import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { IUser } from 'src/users/user.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

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

  async findAll(page: number = 1, limit: number = 2): Promise<{ data: Company[], total: number ,totalPages: number  }> {
    const skip = (page - 1) * limit; // Tính toán số lượng tài liệu cần bỏ qua
    const total = await this.companyModel.countDocuments({ isDeleted: false }); // Tổng số tài liệu chưa bị xóa mềm
    const totalPages = Math.ceil(total / limit);
    const companies = await this.companyModel.find({ isDeleted: false }).skip(skip).limit(limit); // Lấy dữ liệu

    return { data: companies, total, totalPages }; // Trả về dữ liệu và tổng số tài liệu
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
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
