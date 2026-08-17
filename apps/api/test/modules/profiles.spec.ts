import { ProfilesService } from '../../src/modules/users/services/profiles.service';
import { ProfilesRepository } from '../../src/database/repositories/profiles.repository';
import { UsersRepository } from '../../src/database/repositories/users.repository';
import { RolesRepository } from '../../src/database/repositories/roles.repository';

describe('ProfilesService', () => {
  let profilesService: ProfilesService;
  let mockProfilesRepo: jest.Mocked<ProfilesRepository>;
  let mockUsersRepo: jest.Mocked<UsersRepository>;
  let mockRolesRepo: jest.Mocked<RolesRepository>;

  beforeEach(() => {
    mockProfilesRepo = {
      findByUserId: jest.fn(),
      findByUserIdTx: jest.fn(),
      findByUsername: jest.fn(),
      isUsernameTakenTx: jest.fn(),
      upsertProfileTx: jest.fn(),
      updateProfileTx: jest.fn().mockImplementation(async (tx, userId, data) => ({
        id: 'profile-1',
        userId,
        username: 'testuser',
        displayName: data.displayName || 'testuser',
        avatarMediaId: data.avatarMediaId || null,
        bio: data.bio || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    } as any;

    mockUsersRepo = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'test@finance.com',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
      findByEmail: jest.fn(),
      upsertUserTx: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    mockRolesRepo = {
      findByName: jest.fn(),
      findByNameTx: jest.fn(),
      getUserRoles: jest.fn().mockResolvedValue(['MEMBER']),
      assignRoleTx: jest.fn(),
    } as any;

    profilesService = new ProfilesService(
      mockProfilesRepo,
      mockUsersRepo,
      mockRolesRepo,
    );
  });

  it('should fetch public profile by username stripping private fields', async () => {
    mockProfilesRepo.findByUsername.mockResolvedValue({
      id: 'profile-1',
      userId: 'user-1',
      username: 'johndoe',
      displayName: 'John Doe',
      avatarMediaId: null,
      bio: 'Finance enthusiast',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const publicProfile = await profilesService.getPublicProfileByUsername('johndoe');

    expect(publicProfile.username).toBe('johndoe');
    expect(publicProfile.displayName).toBe('John Doe');
    expect((publicProfile as any).email).toBeUndefined();
  });

  it('should update profile display name and bio successfully', async () => {
    const updated = await profilesService.updateProfile('user-1', {
      displayName: 'Updated Name',
      bio: 'New bio',
    });

    expect(updated.displayName).toBe('Updated Name');
    expect(updated.bio).toBe('New bio');
    expect(mockProfilesRepo.updateProfileTx).toHaveBeenCalledWith(
      undefined,
      'user-1',
      expect.objectContaining({ displayName: 'Updated Name', bio: 'New bio' }),
    );
  });
});
