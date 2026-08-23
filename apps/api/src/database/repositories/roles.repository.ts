import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { rolesTable } from '../schema/roles.schema';
import { userRolesTable } from '../schema/user-roles.schema';

export type RoleEntity = typeof rolesTable.$inferSelect;

@Injectable()
export class RolesRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findByName(name: string): Promise<RoleEntity | undefined> {
    return this.findByNameTx(undefined, name);
  }

  async findByNameTx(tx: any, name: string): Promise<RoleEntity | undefined> {
    const client = tx || this.db;
    const [role] = await client.select().from(rolesTable).where(eq(rolesTable.name, name));
    return role;
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const records = await this.db
      .select({ name: rolesTable.name })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, userId));

    return records.map((r) => r.name);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    return this.assignRoleTx(undefined, userId, roleId);
  }

  async assignRoleTx(tx: any, userId: string, roleId: string): Promise<void> {
    const client = tx || this.db;
    await client
      .insert(userRolesTable)
      .values({
        userId,
        roleId,
        assignedAt: new Date(),
      })
      .onConflictDoNothing({
        target: [userRolesTable.userId, userRolesTable.roleId],
      });
  }

  async revokeRoleTx(tx: any, userId: string, roleId: string): Promise<boolean> {
    const client = tx || this.db;
    const [deleted] = await client
      .delete(userRolesTable)
      .where(and(eq(userRolesTable.userId, userId), eq(userRolesTable.roleId, roleId)))
      .returning();
    return !!deleted;
  }
}
