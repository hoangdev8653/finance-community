import { Module, forwardRef } from '@nestjs/common';
import { JitProvisioningService } from './services/jit-provisioning.service';
import { ProfilesService } from './services/profiles.service';
import { UsersController } from './controllers/users.controller';
import { UsersRepository } from '../../database/repositories/users.repository';
import { RolesRepository } from '../../database/repositories/roles.repository';
import { ProfilesRepository } from '../../database/repositories/profiles.repository';
import { MediaModule } from '../media/media.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [forwardRef(() => MediaModule), AuditModule],
  controllers: [UsersController],
  providers: [
    JitProvisioningService,
    ProfilesService,
    UsersRepository,
    RolesRepository,
    ProfilesRepository,
  ],
  exports: [
    JitProvisioningService,
    ProfilesService,
    UsersRepository,
    RolesRepository,
    ProfilesRepository,
  ],
})
export class UsersModule {}
