import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from '../services/profiles.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('users/me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile and session roles', description: 'Triggers JIT user provisioning if first login' })
  @ApiResponse({ status: 200, description: 'Current authenticated user profile and assigned roles' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer JWT' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  getCurrentUserMe(@CurrentUser() user: any) {
    return this.profilesService.getCurrentUserMe(user.sub);
  }

  @Patch('users/me/profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile details' })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid avatar media ID' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer JWT' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateProfile(user.sub, dto);
  }

  @Public()
  @Get('profiles/:username')
  @ApiOperation({ summary: 'Get public user profile by username' })
  @ApiResponse({ status: 200, description: 'Public profile object' })
  @ApiResponse({ status: 404, description: 'Profile username not found' })
  getPublicProfile(@Param('username') username: string) {
    return this.profilesService.getPublicProfileByUsername(username);
  }
}
