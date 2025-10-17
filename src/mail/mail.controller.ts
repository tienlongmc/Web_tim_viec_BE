import { Controller, Get } from '@nestjs/common';
// import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { JobDocument } from 'src/jobs/schema/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';
import { MailService } from './mail.service';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService,
    private mailerService: MailerService,
    private configService: ConfigService,
    // private jobModel:SoftDeleteModel<JobDocument>
    @InjectModel('Job') private readonly jobModel: SoftDeleteModel<JobDocument>, // Đúng cách inject
    @InjectModel('User') private readonly userModel: SoftDeleteModel<UserDocument>,
  ) { }


  @Get()
  @Public()
  @ResponseMessage("Test email")
  @Cron('39 9 * * 5')
  async handleTestEmail() {
    const users = await this.userModel.find({ role: "675d22c722092d29f819f586" });
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
    // await this.mailerService.sendMail({
    //   to: "letienlongmc2003@gmail.com",
    //   from: '"Support Team" <support@example.com>', // override default from
    //   subject: 'Welcome to Nice App! Confirm your Email',
    //   html: '<b>welcome bla bla</b>', // HTML body content
    //   });
  }


  @Get('register')
  @Public()
  TestMail() {
    this.mailerService.sendMail({
      to: "tienlongsuper2003@gmail.com",
      from: '"TOP HIKING JOB" <support@example.com>',
      subject: 'Verify Code',
      template: 'register',
      context: {
        name: "Eric",
        activationCode: 123456
      }
    })
    return "ok";
  }

  @Cron('*/10 * * * * *')
  handleCron() {
    const jwtSecret = this.configService.get<string>('JWT_ACCESS_TOKEN');
    // this.logger.log(`🔐 JWT_SECRET hiện tại là: ${jwtSecret}`);
    console.log(`🔐 JWT_SECRET hiện tại là: ${jwtSecret}`);
  }
}