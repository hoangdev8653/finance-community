import { JitProvisioningService } from '../../src/modules/users/services/jit-provisioning.service';

describe('JitProvisioningService', () => {
  let jitService: JitProvisioningService;

  beforeEach(() => {
    jitService = new JitProvisioningService();
  });

  it('should provision user, profile, and default MEMBER role on first authentication', async () => {
    const sub = '550e8400-e29b-41d4-a716-446655440000';
    const email = 'newuser@finance.com';

    const user = await jitService.ensureUserProvisioned({ sub, email });

    expect(user).toBeDefined();
    expect(user.id).toBe(sub);
    expect(user.email).toBe(email);
    expect(user.status).toBe('ACTIVE');

    const roles = jitService.getUserRoles(sub);
    expect(roles).toContain('MEMBER');
  });

  it('should generate collision-safe username without transaction errors', async () => {
    const sub1 = '11111111-1111-1111-1111-111111111111';
    const sub2 = '22222222-2222-2222-2222-222222222222';
    const email1 = 'john.doe@finance.com';
    const email2 = 'john.doe@otherdomain.com';

    await jitService.ensureUserProvisioned({ sub: sub1, email: email1 });
    await jitService.ensureUserProvisioned({ sub: sub2, email: email2 });

    const username1 = jitService.generateUniqueUsername(email1, sub1);
    const username2 = jitService.generateUniqueUsername(email2, sub2);

    expect(username1).toBe('johndoe');
    expect(username2).toBe('johndoe_22222222222222222222222222222222');
    expect(username2.length).toBeLessThanOrEqual(50);
  });
});
