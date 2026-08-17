import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { rolesTable } from './roles.schema';

export const userRolesTable = pgTable(
  'user_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => rolesTable.id, { onDelete: 'restrict' }),
    assignedBy: uuid('assigned_by').references(() => usersTable.id, { onDelete: 'set null' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('uq_user_roles_user_role').on(table.userId, table.roleId)],
);
