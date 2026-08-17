import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { FollowsRepository } from '../../../database/repositories/follows.repository';
import { ProfilesRepository } from '../../../database/repositories/profiles.repository';

@Injectable()
export class FollowsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB,
    private readonly followsRepo: FollowsRepository,
    private readonly profilesRepo: ProfilesRepository,
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

    return {
      following: true,
      followingId,
      isNew: !alreadyFollowing,
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
