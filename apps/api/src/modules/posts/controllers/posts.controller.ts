import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { QueryPostsDto } from '../dto/query-posts.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { EmailVerificationGuard } from '../../auth/guards/email-verification.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { JitProvisioningService } from '../../users/services/jit-provisioning.service';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly jitService: JitProvisioningService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get published posts feed with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of PostEntity items' })
  getPostsFeed(@Query() query: QueryPostsDto) {
    return this.postsService.findFeedPaginated(query);
  }

  @Public()
  @Get(':contentType/:slug')
  @ApiOperation({ summary: 'Get published post detail by content type and slug' })
  @ApiResponse({ status: 200, description: 'Post detail object with tags and media' })
  @ApiResponse({ status: 404, description: 'Post not found or unpublished' })
  getPostBySlug(
    @Param('contentType') contentType: string,
    @Param('slug') slug: string,
  ) {
    return this.postsService.getPostBySlug(contentType, slug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new post draft or publish immediately' })
  @ApiResponse({ status: 201, description: 'Created PostEntity' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid category/tag' })
  @ApiResponse({ status: 403, description: 'Email verification required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)
  createPost(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(user.sub, dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update existing post' })
  @ApiResponse({ status: 200, description: 'Updated PostEntity' })
  @ApiResponse({ status: 403, description: 'Author or Moderator permission required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  updatePost(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.postsService.updatePost(user.sub, roles, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft-delete post' })
  @ApiResponse({ status: 204, description: 'Post soft-deleted successfully' })
  @ApiResponse({ status: 403, description: 'Author or Moderator permission required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async deletePost(@CurrentUser() user: any, @Param('id') id: string) {
    const roles = this.jitService.getUserRoles(user.sub);
    await this.postsService.deletePost(user.sub, roles, id);
  }
}
