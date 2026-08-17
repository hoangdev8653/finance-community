import { FollowsService } from '../../src/modules/follows/services/follows.service';
import { FollowsRepository } from '../../src/database/repositories/follows.repository';
import { ProfilesRepository } from '../../src/database/repositories/profiles.repository';

describe('FollowsService (Social Network Graph)', () => {
  let followsService: FollowsService;
  let mockDb: any;
  let mockFollowsRepo: jest.Mocked<FollowsRepository>;
  let mockProfilesRepo: jest.Mocked<ProfilesRepository>;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(async (cb) => cb(mockDb)),
    };

    mockFollowsRepo = {
      followTx: jest.fn().mockResolvedValue(true),
      unfollowTx: jest.fn().mockResolvedValue(true),
      isFollowing: jest.fn().mockResolvedValue(false),
      findFollowersPaginated: jest.fn().mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      }),
      findFollowingPaginated: jest.fn().mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      }),
    } as any;

    mockProfilesRepo = {
      findByUserId: jest.fn().mockImplementation(async (userId) => {
        if (userId === 'target-user-1') {
          return {
            id: 'prof-1',
            userId: 'target-user-1',
            username: 'target_user',
            displayName: 'Target User',
            avatarMediaId: null,
            bio: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        return undefined;
      }),
    } as any;

    followsService = new FollowsService(mockDb, mockFollowsRepo, mockProfilesRepo);
  });

  it('should follow user on first request (201 Created contract)', async () => {
    const res = await followsService.followUser('follower-user-1', 'target-user-1');

    expect(res.following).toBe(true);
    expect(res.isNew).toBe(true);
    expect(mockFollowsRepo.followTx).toHaveBeenCalledWith(expect.anything(), 'follower-user-1', 'target-user-1');
  });

  it('should handle duplicate follow request idempotently (200 OK contract)', async () => {
    mockFollowsRepo.isFollowing.mockResolvedValueOnce(true);

    const res = await followsService.followUser('follower-user-1', 'target-user-1');

    expect(res.following).toBe(true);
    expect(res.isNew).toBe(false);
  });

  it('should handle unfollow request idempotently', async () => {
    const res = await followsService.unfollowUser('follower-user-1', 'target-user-1');

    expect(res.following).toBe(false);
    expect(mockFollowsRepo.unfollowTx).toHaveBeenCalledWith(expect.anything(), 'follower-user-1', 'target-user-1');
  });

  it('should reject self-follow attempt with 400 Bad Request CANNOT_FOLLOW_SELF', async () => {
    await expect(
      followsService.followUser('user-same-1', 'user-same-1'),
    ).rejects.toThrow('You cannot follow yourself.');
  });
});
