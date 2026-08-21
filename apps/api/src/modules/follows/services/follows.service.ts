import { Injectable, NotFoundException, BadRequestException, Inject, Optional } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { FollowsRepository } from '../../../database/repositories/follows.repository';
import { ProfilesRepository } from '../../../database/repositories/profiles.repository';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly followsRepo: FollowsRepository,
    private readonly profilesRepo: ProfilesRepository,
    @Optional() private readonly notificationsService?: NotificationsService,
  ) {}

  async followUser(followerId: string, followingId: string): Promise<{ following: boolean; followingId: string; isNew: boolean }> {
    if (followerId === followingId) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'You cannot follow yourself.',
        code: 'CANNOT_FOLLOW_SELF',
      });
    }

    const targetProfile = await this.profilesRepo.findByUserId(followingId);
    if (!targetProfile) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `User '${followingId}' not found.`,
        code: 'USER_NOT_FOUND',
      });
    }

    const alreadyFollowing = await this.followsRepo.isFollowing(followerId, followingId);

    await this.db.transaction(async (tx) => {
      await this.followsRepo.followTx(tx, followerId, followingId);
    });

    const isNew = !alreadyFollowing;

    if (isNew && this.notificationsService) {
      try {
        await this.notificationsService.createNotification({
          userId: followingId,
          type: 'NEW_FOLLOWER',
          title: 'Người theo dõi mới',
          message: `Có người dùng mới bắt đầu theo dõi bạn`,
          referenceUserId: followerId,
        });
      } catch {
        // Non-blocking notification dispatch
      }
    }

    return {
      following: true,
      followingId,
      isNew,
    };
  }

  async unfollowUser(followerId: string, followingId: string): Promise<{ following: boolean; followingId: string }> {
    if (followerId === followingId) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'You cannot follow yourself.',
        code: 'CANNOT_FOLLOW_SELF',
      });
    }

    await this.db.transaction(async (tx) => {
      await this.followsRepo.unfollowTx(tx, followerId, followingId);
    });

    return {
      following: false,
      followingId,
    };
  }

  async getFollowers(followingId: string, page = 1, limit = 20) {
    return this.followsRepo.findFollowersPaginated(followingId, page, limit);
  }

  async getFollowing(followerId: string, page = 1, limit = 20) {
    return this.followsRepo.findFollowingPaginated(followerId, page, limit);
  }
}
