import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const mediaTable = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploaderId: uuid('uploader_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  cloudinaryPublicId: varchar('cloudinary_public_id', { length: 255 })
    .notNull()
    .unique('uq_media_cloudinary_public_id'),
  secureUrl: varchar('secure_url', { length: 500 }).notNull(),
  resourceType: varchar('resource_type', { length: 20 }).notNull(),
  format: varchar('format', { length: 20 }),
  width: integer('width'),
  height: integer('height'),
  fileSize: integer('file_size'),
  // Uniqueness is enforced by the partial migration index so soft-deleted assets can be re-uploaded.
  contentHash: varchar('content_hash', { length: 64 }),
  purpose: varchar('purpose', { length: 20 }).notNull().default('content'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
