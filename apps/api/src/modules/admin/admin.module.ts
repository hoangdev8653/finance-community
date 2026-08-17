import { Module, forwardRef } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { UsersRepository } from '../../database/repositories/users.repository';
import { RolesRepository } from '../../database/repositories/roles.repository';
import { SystemSettingsRepository } from '../../database/repositories/system-settings.repository';
import { FeatureFlagsRepository } from '../../database/repositories/feature-flags.repository';
import { AuditLogRepository } from '../../database/repositories/audit-log.repository';
import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    UsersRepository,
    RolesRepository,
    SystemSettingsRepository,
    FeatureFlagsRepository,
    AuditLogRepository,
  ],
  exports: [AdminService],
})
export class AdminModule {}
