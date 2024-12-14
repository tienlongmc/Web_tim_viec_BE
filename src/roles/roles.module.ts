import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schema/role.schema';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [MongooseModule.forFeature([{name:Role.name,schema: RoleSchema}])],
  exports: [RolesService]
})
export class RolesModule {}
