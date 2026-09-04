import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../decorators/public.decorator';

import { GoogleAuthDto } from '../dto/google-auth.dto';
import { LogoutDto } from '../dto/logout.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user account (Native Local Authentication)' })
  @ApiResponse({ status: 201, description: 'User account registered successfully with Bearer accessToken' })
  @ApiResponse({ status: 400, description: 'Validation error (invalid email, weak password, or bad username)' })
  @ApiResponse({ status: 409, description: 'Email address or username is already taken' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user account (Native Local Authentication)' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully with Bearer accessToken' })
  @ApiResponse({ status: 401, description: 'Invalid email or password credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quick 1-Click Social Authentication via Google OAuth ID Token' })
  @ApiResponse({ status: 200, description: 'User authenticated via Google with Bearer accessToken' })
  @ApiResponse({ status: 401, description: 'Google ID Token verification failed' })
  authenticateGoogle(@Body() dto: GoogleAuthDto) {
    return this.authService.authenticateGoogleUser(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  @ApiResponse({ status: 200, description: 'New token pair issued' })
  refresh(@Body() dto: { refreshToken: string }) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh tokens' })
  @ApiResponse({ status: 200, description: 'User logged out and tokens revoked successfully' })
  logout(@Body() dto?: LogoutDto) {
    return this.authService.logout(undefined, dto?.refreshToken);
  }
}
