import { Injectable, Inject } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { domainsTable } from '../schema/domains.schema';

@Injectable()
export class DomainsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(): Promise<typeof domainsTable.$inferSelect[]> {
    return this.db
      .select()
      .from(domainsTable)
      .where(eq(domainsTable.isActive, true))
      .orderBy(asc(domainsTable.sortOrder), asc(domainsTable.name));
  }
}
