import { AdminService } from '../../src/modules/admin/services/admin.service';

describe('AdminService (Governance & RBAC Management)', () => {
  let adminService: AdminService;
  let mockDb: any;
  let mockUsersRepo: any;
  let mockRolesRepo: any;
  let mockSystemSettingsRepo: any;
  let mockFeatureFlagsRepo: any;
  let mockAuditLogRepo: any;
  let mockAuditLogService: any;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(async (cb) => cb(mockDb)),
    };

    mockUsersRepo = {
      findById: jest.fn().mockImplementation(async (id) => {
        if (id === 'user-member-1') return { id: 'user-member-1', status: 'ACTIVE' };
        if (id === 'user-admin-1') return { id: 'user-admin-1', status: 'ACTIVE' };
        if (id === 'user-super-1') return { id: 'user-super-1', status: 'ACTIVE' };
        return undefined;
      }),
      updateStatusTx: jest.fn().mockResolvedValue({ id: 'user-member-1', status: 'SUSPENDED' }),
    };

    mockRolesRepo = {
      getUserRoles: jest.fn().mockImplementation(async (userId) => {
        if (userId === 'user-member-1') return ['MEMBER'];
        if (userId === 'user-admin-1') return ['ADMIN'];
        if (userId === 'user-super-1') return ['SUPER_ADMIN'];
        return ['MEMBER'];
      }),
      findByName: jest.fn().mockImplementation(async (name) => ({ id: `role-${name}`, name })),
      assignRoleTx: jest.fn().mockResolvedValue(undefined),
      revokeRoleTx: jest.fn().mockResolvedValue(true),
    };

    mockSystemSettingsRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      upsertTx: jest.fn().mockResolvedValue({ key: 'site_title', value: { title: 'Finance Community' } }),
    };

    mockFeatureFlagsRepo = {
      findAll: jest.fn().mockResolvedValue([
        { key: 'enable_comments', isEnabled: true, description: 'Enable post comments' },
        { key: 'enable_maintenance', isEnabled: false, description: 'Maintenance mode' },
      ]),
      toggleTx: jest.fn().mockResolvedValue({ key: 'enable_comments', isEnabled: true }),
    };

    mockAuditLogRepo = {
      findLogsPaginated: jest.fn().mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      }),
    };

    mockAuditLogService = {
      log: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    adminService = new AdminService(
      mockDb,
      mockUsersRepo,
      mockRolesRepo,
      mockSystemSettingsRepo,
      mockFeatureFlagsRepo,
      mockAuditLogRepo,
      mockAuditLogService,
    );
  });

  it('should allow ADMIN to suspend a MEMBER user and write audit log', async () => {
    const res = await adminService.changeUserStatus('user-admin-1', ['ADMIN'], 'user-member-1', {
      status: 'SUSPENDED',
      reason: 'Multiple policy violations',
    });

    expect(res?.status).toBe('SUSPENDED');
    expect(mockUsersRepo.updateStatusTx).toHaveBeenCalledWith(expect.anything(), 'user-member-1', 'SUSPENDED');
    expect(mockAuditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_STATUS_CHANGE', entity_id: 'user-member-1' }),
      expect.anything(),
    );
  });

  it('should reject self-status modification attempt', async () => {
    await expect(
      adminService.changeUserStatus('user-admin-1', ['ADMIN'], 'user-admin-1', {
        status: 'SUSPENDED',
        reason: 'Self suspend',
      }),
    ).rejects.toThrow('Administrators cannot modify their own account status.');
  });

  it('should reject ADMIN attempt to modify SUPER_ADMIN user status', async () => {
    await expect(
      adminService.changeUserStatus('user-admin-1', ['ADMIN'], 'user-super-1', {
        status: 'SUSPENDED',
        reason: 'Unauthorized',
      }),
    ).rejects.toThrow('Only SUPER_ADMIN can modify a SUPER_ADMIN user status.');
  });

  it('should reject ADMIN attempt to assign SUPER_ADMIN role (privilege escalation protection)', async () => {
    await expect(
      adminService.assignRole('user-admin-1', ['ADMIN'], {
        userId: 'user-member-1',
        roleName: 'SUPER_ADMIN',
      }),
    ).rejects.toThrow("Only SUPER_ADMIN can assign 'SUPER_ADMIN' role.");
  });

  it('should return simple key-boolean map for public feature flags endpoint', async () => {
    const flagsMap = await adminService.getPublicFeatureFlags();

    expect(flagsMap).toEqual({
      enable_comments: true,
      enable_maintenance: false,
    });
  });

  it('should return aggregated overview with 7-day time series and status breakdown', async () => {
    mockDb.select = jest.fn().mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockResolvedValue([{ value: 10 }]),
        groupBy: jest.fn().mockResolvedValue([{ status: 'ACTIVE', count: 10 }]),
      })),
    }));

    const overview = await adminService.getOverview();

    expect(overview).toHaveProperty('totalPosts');
    expect(overview).toHaveProperty('activeUsers');
    expect(overview).toHaveProperty('reviewQueue');
    expect(overview).toHaveProperty('openReports');
    expect(overview.userGrowthSeries).toHaveLength(7);
    expect(overview.postGrowthSeries).toHaveLength(7);
    expect(overview.userStatusBreakdown).toBeDefined();
    expect(overview.postStatusBreakdown).toBeDefined();
  });
});
