import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema'; 
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/roles/schema/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }
                                ,{name: Role.name, schema: RoleSchema}
    ]), // Đảm bảo model được tiêm đúng cách
    
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService,MongooseModule] // để auth module có thể gọi được
})
export class UsersModule {}
