import { Module, Global, OnApplicationShutdown, Inject } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

import { databaseConfig } from '../config/database.config';
import { DRIZZLE_TOKEN, PG_POOL_TOKEN } from './database.constants';
import { schema } from './schema';

export type DrizzleDB = NodePgDatabase<typeof schema>;

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [
    {
      provide: PG_POOL_TOKEN,
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => {
        return new Pool({
          connectionString: dbConfig.url,
          max: dbConfig.maxConnections,
          idleTimeoutMillis: dbConfig.idleTimeoutMs,
          connectionTimeoutMillis: dbConfig.connectionTimeoutMs,
          ssl: dbConfig.ssl,
        });
      },
    },
    {
      provide: DRIZZLE_TOKEN,
      inject: [PG_POOL_TOKEN],
      useFactory: (pool: Pool): DrizzleDB => {
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE_TOKEN, PG_POOL_TOKEN],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL_TOKEN) private readonly pool: Pool) {}

  async onApplicationShutdown(signal?: string) {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
