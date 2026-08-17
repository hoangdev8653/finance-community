import { JitProvisioningService } from '../../src/modules/users/services/jit-provisioning.service';
import { UsersRepository } from '../../src/database/repositories/users.repository';
import { RolesRepository } from '../../src/database/repositories/roles.repository';
import { ProfilesRepository } from '../../src/database/repositories/profiles.repository';

describe('JitProvisioningService (Database & Concurrency Remediation)', () => {
  let jitService: JitProvisioningService;
  let mockDb: any;
  let mockUsersRepo: jest.Mocked<UsersRepository>;
  let mockRolesRepo: jest.Mocked<RolesRepository>;
  let mockProfilesRepo: jest.Mocked<ProfilesRepository>;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(async (cb) => {
        const txMock: any = { ...mockDb };
        txMock.transaction = jest.fn(async (nestedCb) => nestedCb(txMock));
        return cb(txMock);
      }),
    };

    mockUsersRepo = {
      upsertUserTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: data.id,
        email: data.email,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    mockRolesRepo = {
      findByName: jest.fn().mockResolvedValue({ id: 'role-member-uuid', name: 'MEMBER' }),
      findByNameTx: jest.fn().mockResolvedValue({ id: 'role-member-uuid', name: 'MEMBER' }),
      assignRoleTx: jest.fn().mockResolvedValue(undefined),
      getUserRoles: jest.fn(),
    } as any;

    mockProfilesRepo = {
      findByUserId: jest.fn().mockResolvedValue(undefined),
      findByUserIdTx: jest.fn().mockResolvedValue(undefined),
      isUsernameTakenTx: jest.fn().mockResolvedValue(false),
      upsertProfileTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: `profile-${data.userId.slice(0, 8)}`,
        userId: data.userId,
        username: data.username,
        displayName: data.displayName,
      })),
      findByUsername: jest.fn(),
    } as any;

    jitService = new JitProvisioningService(
      mockDb,
      mockUsersRepo,
      mockRolesRepo,
      mockProfilesRepo,
    );
  });

  it('TEST 1: Two concurrent requests for the same Supabase sub (Idempotency & Single Transaction)', async () => {
    const sub = '550e8400-e29b-41d4-a716-446655440000';
    const email = 'concurrent.same@finance.com';

    const requests = Array.from({ length: 2 }, () =>
      jitService.ensureUserProvisioned({ sub, email }),
    );

    const results = await Promise.all(requests);

    expect(results.length).toBe(2);
    expect(results[0].id).toBe(sub);
    expect(results[1].id).toBe(sub);
    expect(mockUsersRepo.upsertUserTx).toHaveBeenCalledTimes(2);
    expect(mockRolesRepo.findByNameTx).toHaveBeenCalled();
    expect(mockProfilesRepo.findByUserIdTx).toHaveBeenCalled();
  });

  it('TEST 2: Two different Supabase users with the same base username', async () => {
    const sub1 = '11111111-1111-1111-1111-111111111111';
    const email1 = 'john.doe1@finance.com';

    const sub2 = '22222222-2222-2222-2222-222222222222';
    const email2 = 'john.doe2@finance.com';

    // First user provisions normally
    mockProfilesRepo.isUsernameTakenTx.mockResolvedValueOnce(false);
    const user1 = await jitService.ensureUserProvisioned({ sub: sub1, email: email1 });

    // Second user detects base username 'johndoe1' or 'johndoe2' is taken
    mockProfilesRepo.isUsernameTakenTx.mockResolvedValueOnce(true);
    const user2 = await jitService.ensureUserProvisioned({ sub: sub2, email: email2 });

    expect(user1.id).toBe(sub1);
    expect(user2.id).toBe(sub2);
    expect(mockProfilesRepo.upsertProfileTx).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ userId: sub1, username: 'johndoe1' }),
    );
    expect(mockProfilesRepo.upsertProfileTx).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: sub2,
        username: 'johndoe2_22222222222222222222222222222222',
      }),
    );
  });

  it('TEST 3: Concurrent provisioning where generated username candidates intentionally collide (23505 SAVEPOINT fallback)', async () => {
    const sub = '33333333-3333-3333-3333-333333333333';
    const email = 'collision@finance.com';

    // Simulate 23505 uq_profiles_username constraint violation on initial insert attempt
    mockProfilesRepo.upsertProfileTx
      .mockRejectedValueOnce({
        code: '23505',
        message: 'duplicate key value violates unique constraint "uq_profiles_username"',
      })
      .mockResolvedValueOnce({
        id: 'profile-33333333',
        userId: sub,
        username: 'collision_33333333333333333333333333333333',
        displayName: 'collision_33333333333333333333333333333333',
        avatarMediaId: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const result = await jitService.ensureUserProvisioned({ sub, email });

    expect(result.id).toBe(sub);
    expect(mockProfilesRepo.upsertProfileTx).toHaveBeenCalledTimes(2);
    expect(mockProfilesRepo.upsertProfileTx).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: sub,
        username: 'collision_33333333333333333333333333333333',
      }),
    );
  });

  it('TEST 4: Generated username maximum length (Guaranteed <= 50 characters)', () => {
    const longEmail = 'extremelylongemailaddressprefixthatexceedsfiftycharacters@finance.com';
    const sub = '44444444-4444-4444-4444-444444444444';

    const baseUsername = jitService.sanitizeUsername(longEmail);
    expect(baseUsername.length).toBeLessThanOrEqual(50);

    const deterministicUsername = jitService.generateDeterministicUsername(longEmail, sub);
    expect(deterministicUsername.length).toBeLessThanOrEqual(50);
    expect(deterministicUsername).toBe('extremelylongemai_44444444444444444444444444444444');
  });

  it('TEST 5: Existing username collision resolution', async () => {
    const sub = '55555555-5555-5555-5555-555555555555';
    const email = 'existing@finance.com';

    mockProfilesRepo.isUsernameTakenTx.mockResolvedValue(true);

    const username = await jitService.generateUniqueUsernamePg(mockDb, email, sub);

    expect(username.length).toBeLessThanOrEqual(50);
    expect(username).toBe('existing_55555555555555555555555555555555');
  });

  it('TEST 6: Rollback behavior (Transaction failure rolls back entire provisioning operation)', async () => {
    const sub = '66666666-6666-6666-6666-666666666666';
    const email = 'rollback@finance.com';

    // Simulate an unrelated database error during profile creation (e.g. FK constraint failure)
    mockProfilesRepo.upsertProfileTx.mockRejectedValue(new Error('Fatal database connection error'));

    await expect(jitService.ensureUserProvisioned({ sub, email })).rejects.toThrow(
      'Fatal database connection error',
    );
  });
});
