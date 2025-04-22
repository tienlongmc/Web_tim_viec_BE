import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from 'src/jobs/schema/job.schema';
import { JobsModule } from 'src/jobs/jobs.module';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [

  ScheduleModule.forRoot(),
  
  MailerModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
      transport: {
      host: configService.get<string>("EMAIL_HOST"),
      secure: false,
      auth: {
      user: configService.get<string>("MAIL_USERNAME"),
      pass: configService.get<string>("MAIL_PASSWORD")
    },
  },
  template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
         strict: true,
      },
  },
  }),
  inject: [ConfigService],
  }),
  MongooseModule.forFeature([
    {name:Job.name,schema:JobSchema}
  ]),
  JobsModule, 
  UsersModule 
  ],
  controllers: [MailController],
  providers: [MailService]
  })
  export class MailModule { }