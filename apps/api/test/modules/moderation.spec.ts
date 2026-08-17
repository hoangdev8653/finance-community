import { ReportsService } from '../../src/modules/reports/services/reports.service';
import { ModerationService } from '../../src/modules/moderation/services/moderation.service';

describe('Moderation & Reports Engine', () => {
  let reportsService: ReportsService;
  let moderationService: ModerationService;
  let mockDb: any;
  let mockReportsRepo: any;
  let mockModerationRepo: any;
  let mockPostsRepo: any;
  let mockCommentsRepo: any;
  let mockUsersRepo: any;
  let mockPostsService: any;
  let mockCommentsService: any;
  let mockProfilesRepo: any;
  let mockAuditLogService: any;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(async (cb) => cb(mockDb)),
    };

    mockReportsRepo = {
      createTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: 'report-uuid-1',
        ...data,
        createdAt: new Date(),
        resolvedAt: null,
      })),
      findById: jest.fn().mockImplementation(async (id) => {
        if (id === 'report-post-1') {
          return {
            id: 'report-post-1',
            reporterId: 'user-reporter-1',
            reportedPostId: 'post-uuid-1',
            reportedCommentId: null,
            reportedUserId: null,
            status: 'OPEN',
          };
        }
        if (id === 'report-user-1') {
          return {
            id: 'report-user-1',
            reporterId: 'user-reporter-1',
            reportedPostId: null,
            reportedCommentId: null,
            reportedUserId: 'user-offender-1',
            status: 'OPEN',
          };
        }
        return undefined;
      }),
      findActiveReportForTarget: jest.fn().mockResolvedValue(undefined),
      findQueuePaginated: jest.fn().mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      }),
      updateStatusTx: jest.fn().mockResolvedValue(true),
    };

    mockModerationRepo = {
      createTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: 'action-uuid-1',
        ...data,
        createdAt: new Date(),
      })),
    };

    mockPostsRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'post-uuid-1', authorId: 'author-1', status: 'PUBLISHED' }),
      updateTx: jest.fn().mockResolvedValue(true),
    };

    mockCommentsRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'comment-uuid-1', authorId: 'author-2', status: 'VISIBLE' }),
      updateTx: jest.fn().mockResolvedValue(true),
    };

    mockUsersRepo = {
      updateStatusTx: jest.fn().mockResolvedValue(true),
    };

    mockPostsService = {
      getPostById: jest.fn().mockImplementation(async (id) => (id === 'post-uuid-1' ? { id: 'post-uuid-1' } : null)),
    };

    mockCommentsService = {
      getCommentById: jest.fn().mockImplementation(async (id) => (id === 'comment-uuid-1' ? { id: 'comment-uuid-1' } : null)),
    };

    mockProfilesRepo = {
      findByUserId: jest.fn().mockImplementation(async (id) => (id === 'user-offender-1' ? { userId: 'user-offender-1' } : null)),
    };

    mockAuditLogService = {
      log: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    reportsService = new ReportsService(
      mockDb,
      mockReportsRepo,
      mockPostsService,
      mockCommentsService,
      mockProfilesRepo,
    );

    moderationService = new ModerationService(
      mockDb,
      mockModerationRepo,
      mockReportsRepo,
      mockPostsRepo,
      mockCommentsRepo,
      mockUsersRepo,
      mockAuditLogService,
    );
  });

  it('should file report for a valid single target', async () => {
    const res = await reportsService.fileReport('user-reporter-1', {
      reportedPostId: 'post-uuid-1',
      reason: 'Spam content',
    });

    expect(res.isDuplicate).toBe(false);
    expect(res.report.reportedPostId).toBe('post-uuid-1');
  });

  it('should reject report filing with multiple targets', async () => {
    await expect(
      reportsService.fileReport('user-reporter-1', {
        reportedPostId: 'post-uuid-1',
        reportedCommentId: 'comment-uuid-1',
        reason: 'Invalid',
      }),
    ).rejects.toThrow('Exactly one target (reportedPostId, reportedCommentId, or reportedUserId) must be specified.');
  });

  it('should execute HIDE_CONTENT action on post report and write audit log in 1 transaction', async () => {
    const action = await moderationService.executeAction('mod-user-1', ['MODERATOR'], {
      reportId: 'report-post-1',
      actionType: 'HIDE_CONTENT',
      reason: 'Violates terms of service',
    });

    expect(action.actionType).toBe('HIDE_CONTENT');
    expect(mockPostsRepo.updateTx).toHaveBeenCalledWith(expect.anything(), 'post-uuid-1', { status: 'HIDDEN' });
    expect(mockReportsRepo.updateStatusTx).toHaveBeenCalledWith(expect.anything(), 'report-post-1', 'RESOLVED');
    expect(mockAuditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'MODERATION_HIDE_CONTENT', entity_id: 'post-uuid-1' }),
      expect.anything(),
    );
  });

  it('should reject HIDE_CONTENT action against a user target', async () => {
    await expect(
      moderationService.executeAction('mod-user-1', ['MODERATOR'], {
        reportId: 'report-user-1',
        actionType: 'HIDE_CONTENT',
        reason: 'Invalid action type for user',
      }),
    ).rejects.toThrow("Action 'HIDE_CONTENT' cannot be applied to a USER target.");
  });
});
