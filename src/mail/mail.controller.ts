import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { JobDocument } from 'src/jobs/schema/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserDocument } from 'src/users/schemas/user.schema';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService,
    private mailerService: MailerService,
    // private jobModel:SoftDeleteModel<JobDocument>
    @InjectModel('Job') private readonly jobModel: SoftDeleteModel<JobDocument>, // Đúng cách inject
    @InjectModel('User') private readonly userModel: SoftDeleteModel<UserDocument>,
    
  ) {}

 

 
  @Get()
 @Public()
 @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
 @ResponseMessage("Test email")
 async handleTestEmail() {
  const users = await this.userModel.find({ role: 'NORMAL_USER' });
  if (!users || users.length === 0) {
    return { message: 'Không có email nào được gửi đi vì không có người dùng phù hợp.' };
  }
    const recentJobs = await this.jobModel
    .find()
    .sort({ createdAt: -1 })
    .limit(3); // Lấy 3 công việc gần nhất

  const jobs = recentJobs.map((item) => ({
    name: item.name,
    company: item.company.name,
    salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' Đồng',
    skills: item.skills,
  }));

  // Gửi email tới từng người dùng có vai trò "user"
  for (const user of users) {
    await this.mailerService.sendMail({
      to: user.email,
      from: '"TOP HIKING JOB" <support@example.com>',
      subject: 'Gửi bạn job ngon hằng tuần',
      template: 'new-job',
      context: {
        receiver: user.name || 'Bro', // Tên người nhận (nếu có)
        jobs: jobs, // Gửi danh sách jobs
      },
    });

    console.log(`Email đã được gửi tới ${user.email}`);
  }

  return { message: 'Email đã được gửi tới tất cả người dùng có vai trò "user".' };
}

   
}
