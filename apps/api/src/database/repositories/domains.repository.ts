import { Injectable, Inject } from '@nestjs/common';
import { asc, eq, or, ilike, and, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { domainsTable, type DomainEntity, type NewDomainEntity } from '../schema/domains.schema';
import { categoriesTable } from '../schema/categories.schema';
import { learningSeriesTable } from '../schema/learning-series.schema';

export type DomainWithCounts = DomainEntity & {
  categoryCount?: number;
  courseCount?: number;
};

@Injectable()
export class DomainsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(options: { includeInactive?: boolean; search?: string } = {}): Promise<DomainEntity[]> {
    const conditions = [];

    if (!options.includeInactive) {
      conditions.push(eq(domainsTable.isActive, true));
    }

    if (options.search?.trim()) {
      const searchPattern = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(domainsTable.name, searchPattern),
          ilike(domainsTable.code, searchPattern),
          ilike(domainsTable.slug, searchPattern),
        ),
      );
    }

    return this.db
      .select()
      .from(domainsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(domainsTable.sortOrder), asc(domainsTable.name));
  }

  async findById(id: string): Promise<DomainEntity | undefined> {
    const [record] = await this.db.select().from(domainsTable).where(eq(domainsTable.id, id));
    return record;
  }

  async findByCode(code: string): Promise<DomainEntity | undefined> {
    const [record] = await this.db.select().from(domainsTable).where(eq(domainsTable.code, code));
    return record;
  }

  async findBySlug(slug: string): Promise<DomainEntity | undefined> {
    const [record] = await this.db.select().from(domainsTable).where(eq(domainsTable.slug, slug));
    return record;
  }

  async create(data: NewDomainEntity): Promise<DomainEntity> {
    const [record] = await this.db.insert(domainsTable).values(data).returning();
    return record;
  }

  async update(id: string, data: Partial<NewDomainEntity>): Promise<DomainEntity | undefined> {
    const [updated] = await this.db
      .update(domainsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(domainsTable.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<DomainEntity | undefined> {
    const [deleted] = await this.db
      .delete(domainsTable)
      .where(eq(domainsTable.id, id))
      .returning();
    return deleted;
  }

  async countRelations(domainId: string): Promise<{ categories: number; courses: number }> {
    const [catRes] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(categoriesTable)
      .where(eq(categoriesTable.domainId, domainId));

    const [courseRes] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(learningSeriesTable)
      .where(eq(learningSeriesTable.domainId, domainId));

    return {
      categories: catRes?.count ?? 0,
      courses: courseRes?.count ?? 0,
    };
  }
}
