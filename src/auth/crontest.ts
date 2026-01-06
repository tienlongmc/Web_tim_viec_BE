import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class crontest {
    //   private readonly logger = new Logger(TestJwtCron.name);

    constructor(private configService: ConfigService) { }

    // Chạy mỗi phút để test
    @Cron('*/10 * * * * *')
    handleCron() {
        const jwtSecret = this.configService.get<string>('JWT_ACCESS_TOKEN');
        // this.logger.log(`🔐 JWT_SECRET hiện tại là: ${jwtSecret}`);
        // console.log(`🔐 JWT_SECRET hiện tại là: ${jwtSecret}`);
    }
}
