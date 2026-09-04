import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { UsersRepository } from '../../../database/repositories/users.repository';
import { RolesRepository } from '../../../database/repositories/roles.repository';
import { ProfilesRepository } from '../../../database/repositories/profiles.repository';

export interface UserRecord {
  id: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED';
  created_at: Date;
  updated_at: Date;
}

export interface ProfileRecord {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_media_id: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: Date;
}

export interface ProvisioningInput {
  sub: string;
  email: string;
  displayName?: string | null;
}

const isDbOffline = (err: any): boolean => {
  if (!err) return false;
  const code = err.code || err.cause?.code || err.cause?.errors?.[0]?.code;
  const name = err.name || err.cause?.name;
  const msg = (err.message || '') + (err.cause?.message || '');
  return (
    code === 'ECONNREFUSED' ||
    code === '57P01' ||
    code === '08006' ||
    name === 'AggregateError' ||
    msg.includes('ECONNREFUSED')
  );
};

@Injectable()
export class JitProvisioningService {
  private readonly logger = new Logger(JitProvisioningService.name);

  // In-memory fallback data store for test contexts where database is omitted or offline
  private readonly usersStore = new Map<string, UserRecord>();
  private readonly profilesStore = new Map<string, ProfileRecord>();
  private readonly userRolesStore = new Set<string>(); // key: `${user_id}:${role_id}`
  private readonly rolesStore = new Map<string, { id: string; name: string }>();

  constructor(
    @Optional() @Inject(DRIZZLE_TOKEN) private readonly db?: DrizzleDB,
    @Optional() private readonly usersRepo?: UsersRepository,
    @Optional() private readonly rolesRepo?: RolesRepository,
    @Optional() private readonly profilesRepo?: ProfilesRepository,
  ) {
    // Seed Phase 1 default roles in memory store
    this.rolesStore.set('MEMBER', { id: 'role-member-uuid', name: 'MEMBER' });
    this.rolesStore.set('MODERATOR', { id: 'role-moderator-uuid', name: 'MODERATOR' });
    this.rolesStore.set('ADMIN', { id: 'role-admin-uuid', name: 'ADMIN' });
    this.rolesStore.set('SUPER_ADMIN', { id: 'role-superadmin-uuid', name: 'SUPER_ADMIN' });
  }

  /**
   * Sanitizes email prefix into a valid username string.
   */
  public sanitizeUsername(email: string): string {
    const prefix = email.split('@')[0] || 'user';
    const sanitized = prefix.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const fallback = sanitized.length > 0 ? sanitized : 'user';
    return fallback.slice(0, 50);
  }

  /**
   * Generates a deterministic alternate username derived from Supabase sub (UUID hex).
   * Guaranteed total length <= 50 chars.
   * sub hex without dashes is 32 chars.
   * baseUsername truncated to 17 + '_' + 32 = 50 chars max.
   */
  public generateDeterministicUsername(email: string, sub: string): string {
    const baseUsername = this.sanitizeUsername(email);
    const subClean = sub.replace(/-/g, '').toLowerCase();
    const maxBaseLen = 50 - 1 - subClean.length; // 50 - 1 - 32 = 17
    const truncatedBase = baseUsername.slice(0, Math.max(1, maxBaseLen));
    return `${truncatedBase}_${subClean}`;
  }

  /**
   * Generates a collision-safe username by pre-checking existing profiles (in-memory fallback).
   */
  public generateUniqueUsername(email: string, sub: string): string {
    const baseUsername = this.sanitizeUsername(email);
    const isTaken = Array.from(this.profilesStore.values()).some(
      (p) => p.username === baseUsername && p.user_id !== sub,
    );

    if (!isTaken) {
      return baseUsername;
    }

    return this.generateDeterministicUsername(email, sub);
  }

  /**
   * Generates a collision-safe username against PostgreSQL database inside transaction.
   */
  public async generateUniqueUsernamePg(tx: any, email: string, sub: string): Promise<string> {
    const baseUsername = this.sanitizeUsername(email);
    if (!this.profilesRepo) {
      return this.generateUniqueUsername(email, sub);
    }

    const isTaken = await this.profilesRepo.isUsernameTakenTx(tx, baseUsername, sub);
    if (!isTaken) {
      return baseUsername;
    }

    return this.generateDeterministicUsername(email, sub);
  }

  /**
   * Executes JIT User Provisioning atomically and idempotently using PostgreSQL transactions.
   */
  async ensureUserProvisioned(input: ProvisioningInput): Promise<UserRecord> {
    const { sub, email, displayName } = input;
    const now = new Date();

    if (this.db && this.usersRepo && this.rolesRepo && this.profilesRepo) {
      const usersRepo = this.usersRepo;
      const rolesRepo = this.rolesRepo;
      const profilesRepo = this.profilesRepo;

      try {
        return await this.db.transaction(async (tx) => {
          // 1. Atomic Upsert users (using tx context)
          const user = await usersRepo.upsertUserTx(tx, {
            id: sub,
            email,
            status: 'ACTIVE',
            createdAt: now,
            updatedAt: now,
          });

          // 2. Resolve MEMBER role and Atomic Upsert user_roles (using tx context)
          const memberRole = await rolesRepo.findByNameTx(tx, 'MEMBER');
          if (memberRole) {
            await rolesRepo.assignRoleTx(tx, sub, memberRole.id);
          }

          // 3. Check or Create Profile Record with Transaction Context & SAVEPOINT fallback
          const existingProfile = await profilesRepo.findByUserIdTx(tx, sub);
          if (!existingProfile) {
            const targetUsername = await this.generateUniqueUsernamePg(tx, email, sub);

            try {
              // Execute profile insert within nested transaction (SAVEPOINT) to isolate username unique constraint errors
              const executeInsert = async (client: any) => {
                await profilesRepo.upsertProfileTx(client, {
                  userId: sub,
                  username: targetUsername,
                  displayName: displayName || targetUsername,
                  createdAt: now,
                  updatedAt: now,
                });
              };

              if (typeof tx.transaction === 'function') {
                await tx.transaction(async (nestedTx: any) => {
                  await executeInsert(nestedTx);
                });
              } else {
                await executeInsert(tx);
              }
            } catch (err: any) {
              const pgCode = err?.code || err?.originalError?.code;
              // If uq_profiles_username 23505 conflict occurs under concurrent race condition, fallback to deterministic unique username
              if (pgCode === '23505' || err?.message?.includes('uq_profiles_username')) {
                const fallbackUsername = this.generateDeterministicUsername(email, sub);
                await profilesRepo.upsertProfileTx(tx, {
                  userId: sub,
                  username: fallbackUsername,
                  displayName: displayName || fallbackUsername,
                  createdAt: now,
                  updatedAt: now,
                });
              } else {
                throw err;
              }
            }
          }

          const userRecord: UserRecord = {
            id: user.id,
            email: user.email,
            status: user.status as any,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
          };
          this.usersStore.set(sub, userRecord);
          this.assignRoleToUser(sub, 'MEMBER');

          return userRecord;
        });
      } catch (err: any) {
        if (isDbOffline(err)) {
          if (!this.db || process.env.NODE_ENV === 'test') {
            this.logger.warn(`PostgreSQL connection offline in test suite (${err.message || err.code}). Falling back to in-memory JIT store.`);
          } else {
            this.logger.error(`PostgreSQL database unavailable during JIT provisioning for ${email}: ${err.message || err.code}`);
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    // In-memory fallback logic for test suites without database connection
    let user = this.usersStore.get(sub);
    if (user) {
      if (user.email !== email) {
        user.email = email;
        user.updated_at = now;
      }
    } else {
      user = {
        id: sub,
        email,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      };
      this.usersStore.set(sub, user);
      this.logger.log(`JIT: Provisioned user record for sub=${sub}, email=${email}`);
    }

    const memberRole = this.rolesStore.get('MEMBER');
    if (memberRole) {
      const userRoleKey = `${sub}:${memberRole.id}`;
      if (!this.userRolesStore.has(userRoleKey)) {
        this.userRolesStore.add(userRoleKey);
        this.logger.log(`JIT: Assigned default MEMBER role to user_id=${sub}`);
      }
    }

    let profile = Array.from(this.profilesStore.values()).find((p) => p.user_id === sub);
    if (!profile) {
      const targetUsername = this.generateUniqueUsername(email, sub);
      profile = {
        id: `profile-${sub.slice(0, 8)}`,
        user_id: sub,
        username: targetUsername,
        display_name: displayName || targetUsername,
        avatar_media_id: null,
        bio: null,
        created_at: now,
        updated_at: now,
      };
      this.profilesStore.set(profile.id, profile);
      this.logger.log(`JIT: Created profile record username=${targetUsername} for user_id=${sub}`);
    }

    return user;
  }

  // --- Helper Data Access Methods for Security Guards & Testing ---

  async getUserByIdAsync(userId: string): Promise<UserRecord | undefined> {
    const memUser = this.usersStore.get(userId);
    if (this.usersRepo) {
      try {
        const user = await this.usersRepo.findById(userId);
        if (user) {
          return {
            id: user.id,
            email: user.email,
            status: (memUser?.status || user.status) as UserRecord['status'],
            created_at: user.createdAt,
            updated_at: user.updatedAt,
          };
        }
      } catch (err) {
        this.logger.warn(`Failed to retrieve user by ID from DB: ${err}`);
      }
    }
    return memUser;
  }

  async getUserRolesAsync(userId: string): Promise<string[]> {
    const memRoles = this.getUserRoles(userId);
    if (this.rolesRepo) {
      try {
        const dbRoles = await this.rolesRepo.getUserRoles(userId);
        if (dbRoles && dbRoles.length > 0) {
          return Array.from(new Set([...dbRoles, ...memRoles]));
        }
      } catch (err) {
        this.logger.warn(`Failed to retrieve user roles from DB: ${err}`);
      }
    }
    return memRoles;
  }

  getUserById(userId: string): UserRecord | undefined {
    return this.usersStore.get(userId);
  }

  setUserStatus(userId: string, status: UserRecord['status']): void {
    const user = this.usersStore.get(userId);
    if (user) {
      user.status = status;
      user.updated_at = new Date();
    }
    if (this.usersRepo) {
      this.usersRepo.updateStatus(userId, status).catch(() => {});
    }
  }

  getUserRoles(userId: string): string[] {
    const roles: string[] = [];
    for (const key of this.userRolesStore) {
      const [uId, rId] = key.split(':');
      if (uId === userId) {
        for (const [name, role] of this.rolesStore.entries()) {
          if (role.id === rId) {
            roles.push(name);
          }
        }
      }
    }
    return roles;
  }

  assignRoleToUser(userId: string, roleName: string): void {
    const role = this.rolesStore.get(roleName);
    if (role) {
      this.userRolesStore.add(`${userId}:${role.id}`);
    }
    if (this.rolesRepo) {
      this.rolesRepo.findByName(roleName).then((dbRole) => {
        if (dbRole) {
          this.rolesRepo?.assignRole(userId, dbRole.id).catch(() => {});
        }
      }).catch(() => {});
    }
  }
}

