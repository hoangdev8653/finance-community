import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
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

import { RateLimit } from '../../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';

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

  @Get('feed/following')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get posts feed from authors followed by current user' })
  @ApiResponse({ status: 200, description: 'Paginated list of posts from followed authors' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  getFollowingFeed(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.postsService.findFollowingFeed(user.sub, Number(page), Number(limit));
  }

  @Public()
  @Get('feed/trending')
  @ApiOperation({ summary: 'Get trending posts feed sorted by engagement and views' })
  @ApiResponse({ status: 200, description: 'Paginated list of trending posts' })
  getTrendingFeed(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.postsService.findTrendingFeed(Number(page), Number(limit));
  }

  @Get('bookmarks/my-feed')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user saved/bookmarked posts feed' })
  @ApiResponse({ status: 200, description: 'Paginated list of bookmarked posts' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  getMyBookmarks(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.postsService.getMyBookmarkedPosts(user.sub, Number(page), Number(limit));
  }

  @Get('admin/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  @ApiOperation({ summary: 'Get a post for Learning editorial editing' })
  getAdminPost(@Param('id') id: string, @CurrentUser() user: any) { return this.postsService.getPostById(id, user.sub); }

  @Post(':id/bookmark')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle post bookmark (save or unsave)' })
  @ApiResponse({ status: 200, description: 'Bookmark status toggled' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  toggleBookmark(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.postsService.toggleBookmark(user.sub, id);
  }

  @Post(':id/request-review')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Author requests moderation review after modifying banned/hidden post' })
  @ApiResponse({ status: 200, description: 'Review requested' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  requestReview(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.postsService.requestPostReview(user.sub, id);
  }

  @Public()
  @Get('domain/:domainSlug/bai-viet/:slug')
  @ApiOperation({ summary: 'Get published post detail by domain slug and post slug' })
  @ApiResponse({ status: 200, description: 'Post detail object with tags and media' })
  getPostByDomainSlug(
    @Param('domainSlug') domainSlug: string,
    @Param('slug') slug: string,
    @Req() req: any,
  ) {
    const viewerIdentifier = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const viewerUserId = req.user?.sub;
    const viewerRoles = viewerUserId ? this.jitService.getUserRoles(viewerUserId) : undefined;
    return this.postsService.getPostByDomainSlug(domainSlug, slug, viewerIdentifier, viewerUserId, viewerRoles);
  }

  @Public()
  @Get(':contentType/:slug')
  @ApiOperation({ summary: 'Get published post detail by content type and slug' })
  @ApiResponse({ status: 200, description: 'Post detail object with tags and media' })
  @ApiResponse({ status: 404, description: 'Post not found or unpublished' })
  getPostBySlug(
    @Param('contentType') contentType: string,
    @Param('slug') slug: string,
    @Req() req: any,
  ) {
    const viewerIdentifier = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const viewerUserId = req.user?.sub;
    const viewerRoles = viewerUserId ? this.jitService.getUserRoles(viewerUserId) : undefined;
    return this.postsService.getPostBySlug(contentType, slug, viewerIdentifier, viewerUserId, viewerRoles);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new post draft or publish immediately' })
  @ApiResponse({ status: 201, description: 'Created PostEntity' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid category/tag' })
  @ApiResponse({ status: 403, description: 'Email verification required' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (Max 5 posts per hour)' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard, RateLimitGuard)
  @RateLimit({ limit: 5, ttlSeconds: 3600, keyPrefix: 'create_post' })
  createPost(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.postsService.createPost(user.sub, dto, roles);
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
