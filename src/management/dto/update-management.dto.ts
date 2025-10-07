import { PartialType } from '@nestjs/mapped-types';
import { CreateManagementDto } from './create-management.dto';

export class UpdateManagementDto extends PartialType(CreateManagementDto) {}
